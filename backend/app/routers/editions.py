""" This module includes all the edition endpoints """

import datetime
from typing import Dict

from app.config import config
from app.crud import read_all_where, read_where, update
from app.database import get_session
from app.exceptions.edition_exceptions import (AlreadyEditionWithYearException,
                                               EditionNotFound,
                                               EditionYearModifyException,
                                               YearAlreadyOverException)
from app.exceptions.permissions import NotPermittedException
from app.exceptions.questiontag_exceptions import (
    QuestionTagAlreadyExists, QuestionTagCantBeModified,
    QuestionTagInvalidMandatory, QuestionTagNotFoundException)
from app.models.answer import Answer
from app.models.edition import (Edition, EditionCoach, EditionOutExtended,
                                EditionOutSimple)
from app.models.participation import Participation
from app.models.project import Project, ProjectOutSimple
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.question_tag import (QuestionTag, QuestionTagCreate,
                                     QuestionTagSimpleOut, QuestionTagUpdate)
from app.models.skill import StudentSkill
from app.models.student import DecisionOption, Student
from app.models.suggestion import Suggestion, SuggestionOption
from app.models.user import UserRole
from app.utils.checkers import EditionChecker, RoleChecker
from fastapi import APIRouter, Body, Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload
from sqlmodel import func, select

router = APIRouter(prefix="/editions")


def get_sorting(sortstr: str) -> Dict[str, bool]:
    """get_sorting generate the sorting dict from the sort string

    :param sortstr: the sort string
    :type sortstr: str
    :return: dict with sorting directions
    :rtype: Dict[str, bool]
    """
    sorting = [t.split("+") if "+" in t else [t, "asc"] for t in sortstr.split(",")]
    return {t[0]: False if t[1] == "asc" else True for t in sorting}


@router.get("", response_description="Editions retrieved")
async def get_editions(session: AsyncSession = Depends(get_session), role: RoleChecker(UserRole.COACH) = Depends()):
    """get_editions get all the Edition instances from the database

    :return: list of editions
    :rtype: dict
    """
    results = await read_all_where(Edition, session=session)
    results = [EditionOutSimple.parse_raw(r.json()) for r in sorted(results, key=lambda x: x.year, reverse=True)]
    if role == UserRole.ADMIN:
        return [r.uri for r in results]
    if role == UserRole.COACH:
        return [results[0].uri] if results else []


@router.get("/current_edition", response_description="Edition retrieved")
async def get_current_edition(session: AsyncSession = Depends(get_session)) -> dict:
    """get_current_edition get the current edition

    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :return: the edition
    :rtype: dict
    """
    stmnt = select(Edition).order_by(Edition.year.desc())
    result = await session.execute(stmnt)
    return EditionOutExtended.parse_raw(result.one()[0].json())


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Created a new edition")
async def create_edition(edition: Edition = Body(...), session: AsyncSession = Depends(get_session)):
    """create_edition creates a new edition in the database

    :param edition: defaults to Body(...)
    :type edition: Edition, optional
    :return: data of newly created edition
    :rtype: dict
    """
    if int(edition.year) < datetime.date.today().year:
        raise YearAlreadyOverException()
    # check if an edition with the same year is already present
    if await read_where(Edition, Edition.year == edition.year, session=session):
        raise AlreadyEditionWithYearException(edition.year)

    # get the previous edition, we need it to transfer some information to the new edition for convenience
    prev_edition = await read_all_where(Edition, session=session)

    # make the new edition
    new_edition = await update(Edition.parse_obj(edition), session=session)

    if prev_edition:
        prev_edition = sorted(prev_edition, key=lambda x: x.year, reverse=True)[0]
        # make prev edition read-only
        prev_edition.read_only = True
        await update(prev_edition, session=session)
        # add the questiontags (and corresponding questions) from last edition
        qts = await read_all_where(QuestionTag, QuestionTag.edition == prev_edition.year, session=session)
        for qt in qts:
            q = await read_where(Question, Question.id == qt.question_id, session=session)
            new_q = Question(edition=new_edition.year, question=q.question)
            await update(new_q, session=session)
            new_qt = QuestionTag(edition=new_edition.year, tag=qt.tag, question=new_q, mandatory=qt.mandatory, show_in_list=qt.show_in_list)
            await update(new_qt, session=session)

    return EditionOutSimple.parse_raw(new_edition.json()).uri


@router.get("/{year}", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Editions retrieved")
async def get_edition(year: int, edition: EditionChecker() = Depends(), session: AsyncSession = Depends(get_session)):
    """get_edition get the Edition instance with given year

    :return: the edition with that year
    :rtype: dict
    """

    return EditionOutExtended.parse_raw(edition.json())


@router.patch("/{year}", response_description="updated edition")
async def update_edition(year: int, edition: Edition = Body(...), role: RoleChecker(UserRole.COACH) = Depends(), Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)):
    """update_edition update the Edition instance with given year

    :return: the updated edition
    :rtype: dict
    """
    if not year == edition.year:
        raise EditionYearModifyException()

    result = await read_where(Edition, Edition.year == edition.year, session=session)
    if not result:
        raise EditionNotFound()

    # check that the coach has access to that edition
    if role != UserRole.ADMIN:
        edition_coaches = await read_all_where(EditionCoach, EditionCoach.edition == year, session=session)
        user_ids = [coach.coach_id for coach in edition_coaches]
        if not Authorize.get_jwt_subject() in user_ids:
            raise NotPermittedException()

    new_edition_data = edition.dict(exclude_unset=True)
    for key, value in new_edition_data.items():
        setattr(result, key, value)
    await update(result, session)
    return EditionOutSimple.parse_raw(result.json()).uri


@router.get("/{year}/students", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Students retrieved")
async def get_edition_students(year: int, orderby: str = "", search: str = "", skills: str = "", decision: str = "", own_suggestion: str = "", filters: str = "", unmatched: str = "", Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)):
    """get_edition_students get all the students in the edition with given year

    :return: list of all the students in the edition with given year
    :rtype: dict
    """

    student_alias = Student
    student_query = select(Student).where(Student.edition_year == year)
    if own_suggestion:

        s = own_suggestion.upper().split(",")
        if "NO-SUGGESTION" in s:
            suggestion_sub_query = select(Suggestion).where(Suggestion.suggested_by_id == int(Authorize.get_jwt_subject())).where(Suggestion.decision.in_([SuggestionOption[d] for d in list(set(["YES", "MAYBE", "NO", "NO-SUGGESTION"]) - set(s))]))
            suggestion_sub_query = aliased(Suggestion, suggestion_sub_query.distinct().subquery())
            student_query = student_query.outerjoin(suggestion_sub_query, suggestion_sub_query.student_id == Student.id).where(suggestion_sub_query.student_id.is_(None))
        else:
            # Get all the suggestion that match with the user
            suggestion_sub_query = select(Suggestion).where(Suggestion.suggested_by_id == int(Authorize.get_jwt_subject())).where(Suggestion.decision.in_([SuggestionOption[d] for d in own_suggestion.upper().split(",") if d != "NO-SUGGESTION"]))
            suggestion_sub_query = aliased(Suggestion, suggestion_sub_query.distinct().subquery())
            student_query = student_query.join(suggestion_sub_query)

        student_alias = aliased(Student, student_query.distinct().subquery())
        student_query = select(student_alias)

    if filters:
        for filter in filters.split(","):
            student_query = student_query.join(QuestionAnswer, student_alias.id == QuestionAnswer.student_id).join(QuestionTag, QuestionAnswer.question_id == QuestionTag.question_id).where(QuestionTag.tag == filter).join(Answer).where(Answer.answer == "yes")
            student_alias = aliased(student_alias, student_query.subquery())
            student_query = select(student_alias)
    if decision:
        student_query = student_query.where(student_alias.decision.in_([DecisionOption[d] for d in decision.upper().split(",")]))
    if skills:
        student_query = student_query.join(StudentSkill).where(StudentSkill.skill_name.in_(skills.split(",")))
    if unmatched == "true":
        student_query = student_query.outerjoin(Participation, Participation.student_id == student_alias.id).where(Participation.student_id.is_(None))
        student_alias = aliased(student_alias, student_query.distinct().subquery())
        student_query = select(student_alias)
    if search:
        student_query = student_query.join(QuestionAnswer).join(Answer)
        student_query = student_query.where(Answer.answer.ilike("%" + search.replace(" ", "%") + "%"))

    ua = aliased(Student, student_query.distinct().subquery())
    res = await session.execute(select(ua.id))
    res = res.all()

    students = [r for (r,) in res]

    # if there are students check if all mandatory tags are correct
    if len(students) != 0:
        query = select(QuestionTag).where(QuestionTag.edition == year).where(QuestionTag.mandatory == True).join(Question).outerjoin(QuestionAnswer, QuestionAnswer.question_id == Question.id).where(QuestionAnswer.question_id.is_(None))
        res = await session.execute(query)
        resall = res.all()
        if len(resall) != 0:
            raise QuestionTagInvalidMandatory([tag.tag for (tag,) in resall])

    if orderby:
        sorting = get_sorting(orderby).items()
        studentobjects = {i: {"id": i} for i in students}
        for key, val in sorting:
            if key == "id":
                continue
            res = await session.execute(select(ua.id, QuestionTag.tag, Answer.answer).join(QuestionAnswer, ua.id == QuestionAnswer.student_id).join(QuestionTag, QuestionAnswer.question_id == QuestionTag.question_id).where(QuestionTag.tag == key).join(Answer).order_by(ua.id))
            res = res.all()

            for (id, _, r) in res:
                studentobjects[id][key] = r

        sorted_students = studentobjects.values()
        for k, val in reversed(sorting):
            sorted_students = sorted(sorted_students, key=lambda d: d[k], reverse=val)
        students = [str(student["id"]) for student in sorted_students]
    return [config.api_url + "students/" + str(id) for id in students]


@router.get("/{year}/projects", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Projects retrieved")
async def get_edition_projects(year: int, session: AsyncSession = Depends(get_session)):
    """get_projects get all the Project instances from the database

    :return: list of projects
    :rtype: dict
    """
    stat = select(Project).where(Project.edition == int(year))
    res = await session.execute(stat)
    results = [r for (r,) in res.all()]
    return [ProjectOutSimple.parse_raw(r.json()).id for r in results]


@router.get("/{year}/resolving_conflicts", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Students retrieved")
async def get_conflicting_students(year: int, session: AsyncSession = Depends(get_session)):
    """get_conflicting_students gets all students with conflicts in their participations
    within an edition

    :param year: year of the edition
    :type year: int
    :return: list of student_ids with conflicts
    :rtype: list
    """

    student_ids = await session.execute(
        """
        SELECT student.id
        FROM student, participation
        WHERE student.id = participation.student_id
        GROUP BY student.id
        HAVING COUNT (*) > 1;
        """
    )

    return [f"{config.api_url}students/{id}" for (id,) in student_ids]


# Question Tag Endpoints
@router.get("/{year}/questiontags", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker())], response_description="Tags retrieved")
async def get_question_tags(year: int, session: AsyncSession = Depends(get_session)):
    """get_question_tags return list of qusetiontags

    :param year: edition year
    :type year: int
    :param session: _description_, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :return: list of QuestionTags
    :rtype: list of QuestionTags
    """
    res = await session.execute(select(QuestionTag).where(QuestionTag.edition == year).where(QuestionTag.question_id is not None).order_by(QuestionTag.tag))
    tags = res.all()

    return [f"{config.api_url}editions/{str(year)}/questiontags/{tag.tag}" for (tag,) in tags]


@router.get("/{year}/questiontags/{tag}")
async def get_question_tag(year: int, tag: str, session: AsyncSession = Depends(get_session)) -> QuestionTagSimpleOut:
    """get_question_tag get a questiontag by name

    :param year: the edition year
    :type year: int
    :param tag: the tag name
    :type tag: str
    :param session: session used to perform database operations, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises QuestionTagNotFoundException: _description_
    :return: the questiontag information
    :rtype: QuestionTagSimpleOut
    """
    try:
        res = await session.execute(select(QuestionTag).where(QuestionTag.edition == year).where(QuestionTag.tag == tag).options(selectinload(QuestionTag.question)))
        (qtag,) = res.one()
    except Exception:
        raise QuestionTagNotFoundException()

    error = False
    if qtag.question:
        q = qtag.question.question

        # check if there are students and if the question is valid
        student_query = select(func.count(Student.id)).where(Student.edition_year == year)
        student_res = await session.execute(student_query)
        (count,) = student_res.one()
        if count > 0:
            # check if there are answers for the question
            query = select(Question).where(Question.id == qtag.question.id).outerjoin(QuestionAnswer, Question.id == QuestionAnswer.question_id).where(QuestionAnswer.question_id.is_(None))
            query_res = await session.execute(query)
            query_all = query_res.all()

            if (len(query_all)) > 0:
                error = True
    else:
        q = ""

    return QuestionTagSimpleOut(tag=qtag.tag, mandatory=qtag.mandatory, show_in_list=qtag.show_in_list, question=q, error=error)


@router.post("/{year}/questiontags", dependencies=[Depends(RoleChecker(UserRole.ADMIN)), Depends(EditionChecker(update=True))], response_description="Added question tag")
async def add_question_tag(year: int, tag: QuestionTagCreate, session: AsyncSession = Depends(get_session)):
    """add_question_tag Create new questiontag

    :param year: edition year
    :type year: int
    :param tag: tagname
    :type tag: QuestionTagCreate
    :param session: _description_, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises QuestionTagAlreadyExists: _description_
    """

    new_questiontag = QuestionTag(tag=tag.tag, edition=year)
    try:
        await update(new_questiontag, session=session)
    except IntegrityError:
        raise QuestionTagAlreadyExists(tag.tag)

    return f"{config.api_url}editions/{str(year)}/questiontags/{tag.tag}"


@router.delete("/{year}/questiontags/{tag}", dependencies=[Depends(RoleChecker(UserRole.ADMIN)), Depends(EditionChecker(update=True))])
async def delete_question_tag(year: int, tag: str, session: AsyncSession = Depends(get_session)):
    """delete_question_tag delete the questiontag

    :param year: edition year
    :type year: int
    :param tag: tagname
    :type tag: str
    :param session: _description_, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises QuestionTagNotFoundException: _description_
    """

    stat = await session.execute(select(QuestionTag).where(QuestionTag.edition == year).where(QuestionTag.tag == tag).options(selectinload(QuestionTag.question).options(selectinload(Question.question_answers))))
    try:
        (questiontag,) = stat.one()
    except Exception:
        raise QuestionTagNotFoundException()

    if questiontag.mandatory:
        raise QuestionTagCantBeModified()

    if questiontag.question and len(questiontag.question.question_answers) == 0:
        # delete the unused question
        questiontag.question_id = None
        await update(questiontag, session=session)

        await session.delete(questiontag.question)
        await session.commit()

    await session.delete(questiontag)
    await session.commit()


@router.patch("/{year}/questiontags/{tag}", dependencies=[Depends(RoleChecker(UserRole.ADMIN)), Depends(EditionChecker(update=True))])
async def modify_question_tag(year: int, tag: str, tagupdate: QuestionTagUpdate, session: AsyncSession = Depends(get_session)):
    """modify_question_tag Modify a question tag to link a question

    :param year: editionyear
    :type year: int
    :param tag: tagname
    :type tag: str
    :param tagupdate: _description_
    :type tagupdate: QuestionTagUpdate
    :param session: _description_, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises QuestionTagNotFoundException: _description_
    """

    stat = await session.execute(select(QuestionTag).where(QuestionTag.edition == year).where(QuestionTag.tag == tag).options(selectinload(QuestionTag.question).options(selectinload(Question.question_answers))))
    try:
        (questiontag,) = stat.one()
    except Exception:
        raise QuestionTagNotFoundException()

    if questiontag.mandatory and questiontag.tag != tag:
        raise QuestionTagCantBeModified()

    questiontag.tag = tagupdate.tag
    questiontag.show_in_list = tagupdate.show_in_list

    if questiontag.question and questiontag.question.question != tagupdate.question:

        if len(questiontag.question.question_answers) == 0:
            # Delete the unused question
            unused_question = questiontag.question
            questiontag.question_id = None
            await update(questiontag, session=session)

            await session.delete(unused_question)
            await session.commit()
        else:
            questiontag.question_id = None
            await update(questiontag, session=session)

    if questiontag.question_id is None and tagupdate.question:
        # Search the new question
        question = await read_where(Question, Question.question == tagupdate.question, Question.edition == year, session=session)

        if question:
            questiontag.question_id = question.id
        else:
            newquestion = Question(question=tagupdate.question, field_id="", edition=year)
            await update(newquestion, session=session)
            questiontag.question_id = newquestion.id

    await update(questiontag, session=session)
    return f"{config.api_url}editions/{str(year)}/questiontags/{questiontag.tag}"
