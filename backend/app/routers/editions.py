import datetime

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
    QuestionTagNotFoundException)
from app.models.answer import Answer
from app.models.edition import (Edition, EditionCoach, EditionOutExtended,
                                EditionOutSimple)
from app.models.project import Project, ProjectCoach, ProjectOutSimple
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.question_tag import (QuestionTag, QuestionTagCreate,
                                     QuestionTagSimpleOut, QuestionTagUpdate)
from app.models.skill import StudentSkill
from app.models.student import DecisionOption, Student
from app.models.user import User, UserRole
from app.utils.checkers import EditionChecker, RoleChecker
from fastapi import APIRouter, Body, Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload
from sqlmodel import select

router = APIRouter(prefix="/editions")


def get_sorting(sortstr: str):
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

    new_edition = await update(Edition.parse_obj(edition), session=session)
    return EditionOutSimple.parse_raw(new_edition.json()).uri


@router.get("/{year}", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Editions retrieved")
async def get_edition(year: int, edition: EditionChecker() = Depends(), session: AsyncSession = Depends(get_session)):
    """get_edition get the Edition instance with given year

    :return: list of editions
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
    if not role != UserRole.ADMIN:
        edition_coaches = await read_all_where(EditionCoach, EditionCoach.edition == year, session=session)
        user_ids = [coach.coach_id for coach in edition_coaches]
        if not Authorize.get_jwt_subject() in user_ids:
            raise NotPermittedException()

    new_edition_data = edition.dict(exclude_unset=True)
    for key, value in new_edition_data.items():
        setattr(result, key, value)
    await update(result, session)
    return EditionOutSimple.parse_raw(result.json()).uri


@router.get("/{year}/users", response_description="Users retrieved")
async def get_edition_users(year: int, role: RoleChecker(UserRole.COACH) = Depends(), session: AsyncSession = Depends(get_session)):
    """get_users get all the User instances from the database in edition with given year

    :return: list of users
    :rtype: dict
    """

    edition_coaches = await read_all_where(EditionCoach, EditionCoach.edition == year, session=session)
    user_ids = [coach.coach_id for coach in edition_coaches]
    # get the admins
    admins = await read_all_where(User, User.role == UserRole.ADMIN, session=session)
    user_ids += [admin.id for admin in admins]
    return [f"{config.api_url}users/{str(id)}" for id in user_ids]


@router.get("/{year}/students", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Students retrieved")
async def get_edition_students(year: int, orderby: str = "", search: str = "", skills: str = "", decision: str = "", session: AsyncSession = Depends(get_session)):
    """get_edition_students get all the students in the edition with given year

    :return: list of all the students in the edition with given year
    :rtype: dict
    """

    student_query = select(Student).where(Student.edition_year == year)

    if decision:
        student_query = student_query.where(Student.decision.in_([DecisionOption[d] for d in decision.upper().split(",")]))
    if search:
        student_query = student_query.join(QuestionAnswer).join(Answer)
        student_query = student_query.where(Answer.answer.ilike("%" + search + "%"))
    if skills:
        student_query = student_query.join(StudentSkill).where(StudentSkill.skill_name.in_(skills.split(",")))

    ua = aliased(Student, student_query.distinct().subquery())
    res = await session.execute(select(ua.id))
    res = res.all()

    students = [r for (r,) in res]

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


@router.get("/{year}/projects", response_description="Projects retrieved")
async def get_edition_projects(year: int, role: RoleChecker(UserRole.COACH) = Depends(), session: AsyncSession = Depends(get_session), Authorize: AuthJWT = Depends()):
    """get_projects get all the Project instances from the database

    :return: list of projects
    :rtype: dict
    """
    if role == UserRole.ADMIN:
        results = await read_all_where(Project, Project.edition == year, session=session)
    else:
        Authorize.jwt_required()
        current_user_id = Authorize.get_jwt_subject()
        stat = select(Project).select_from(ProjectCoach).where(ProjectCoach.coach_id == int(current_user_id)).join(Project).where(Project.edition == int(year))
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

    return [f"{config.api_url}/students/{id}" for (id,) in student_ids]


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
async def get_question_tag(year: int, tag: str, session: AsyncSession = Depends(get_session)):
    try:
        res = await session.execute(select(QuestionTag).where(QuestionTag.edition == year).where(QuestionTag.tag == tag).options(selectinload(QuestionTag.question)))
        (qtag,) = res.one()
    except Exception:
        raise QuestionTagNotFoundException()

    if qtag.question:
        q = qtag.question.question
    else:
        q = ""

    return QuestionTagSimpleOut(tag=qtag.tag, mandatory=qtag.mandatory, showInList=qtag.showInList, question=q)


@router.get("/{year}/questiontags/showinlist", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker(update=True))], response_description="Tags retrieved")
async def get_showinlist_question_tags(year: int, session: AsyncSession = Depends(get_session)):
    """get_showinlist_question_tags return list of qusetiontags that must be shown in the listview

    :param year: edition year
    :type year: int
    :param session: _description_, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :return: list of QuestionTags
    :rtype: list of QuestionTags
    """
    res = await session.execute(select(QuestionTag).where(QuestionTag.edition == year).where(QuestionTag.question_id is not None).where(QuestionTag.showInList == True).order_by(QuestionTag.tag))
    tags = res.all()
    return [tag.tag for (tag,) in tags]


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

    if not questiontag.mandatory:
        questiontag.tag = tagupdate.tag
    else:
        raise QuestionTagCantBeModified()

    questiontag.showInList = tagupdate.showInList

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
