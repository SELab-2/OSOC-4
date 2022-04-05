import datetime
import json
from typing import List, Optional

from app.config import config
from app.crud import read_all_where, read_where, update
from app.database import db, get_session
from app.exceptions.edition_exceptions import (AlreadyEditionWithYearException,
                                               EditionNotFound,
                                               EditionYearModifyException,
                                               SuggestionRetrieveException,
                                               YearAlreadyOverException)
from app.models.answer import Answer
from app.models.edition import Edition, EditionOutExtended, EditionOutSimple
from app.models.project import Project, ProjectCoach, ProjectOutSimple
from app.models.question_answer import QuestionAnswer
from app.models.question_tag import QuestionTag
from app.models.student import Student
from app.models.suggestion import Suggestion, SuggestionOption
from app.models.user import User, UserRole
from app.utils.checkers import EditionChecker, RoleChecker
from app.utils.response import list_modeltype_response, response
from fastapi import APIRouter, Body, Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased
from sqlmodel import select

router = APIRouter(prefix="/editions")


def get_sorting(sortstr: str):
    sorting = [t.split("+") if "+" in t else [t, "asc"] for t in sortstr.split(",")]
    return {t[0]: False if t[1] == "asc" else True for t in sorting}


@router.get("", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Editions retrieved")
async def get_editions(session: AsyncSession = Depends(get_session)):
    """get_editions get all the Edition instances from the database

    :return: list of editions
    :rtype: dict
    """
    results = await read_all_where(Edition, session=session)
    return [r.uri for r in [EditionOutSimple.parse_raw(r.json()) for r in results]]


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

    user_ids = [u.id for u in edition.coaches]

    # get the admins
    res = await read_all_where(User, User.role == UserRole.ADMIN, session=session)
    user_ids += [admin.id for admin in res]

    edition_json = json.loads(edition.json())
    edition_json["user_ids"] = user_ids

    return EditionOutExtended.parse_raw(json.dumps(edition_json))


@router.patch("/{year}", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="updated edition")
async def update_edition(year: int, edition: Edition = Body(...), session: AsyncSession = Depends(get_session)):
    """update_edition update the Edition instance with given year

    :return: the updated edition
    :rtype: dict
    """
    if not year == edition.year:
        raise EditionYearModifyException()

    result = await read_where(Edition, Edition.year == edition.year, session=session)
    if not result:
        raise EditionNotFound()

    new_edition_data = edition.dict(exclude_unset=True)
    for key, value in new_edition_data.items():
        setattr(result, key, value)
    await update(result, session)
    return EditionOutSimple.parse_raw(result.json()).uri


@router.get("/{year}/students", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Students retrieved")
async def get_edition_students(year: int, orderby: str = "", search: str = "", session: AsyncSession = Depends(get_session)):
    """get_edition_students get all the students in the edition with given year

    :return: list of all the students in the edition with given year
    :rtype: dict
    """

    student_query = select(Student).where(Student.edition_year == year).subquery()
    if search:
        student_query = select(Student).where(Student.edition_year == year).join(QuestionAnswer).join(Answer)
        student_query = student_query.where(Answer.answer.ilike("%" + search + "%"))
        student_query = student_query.distinct().subquery()

    ua = aliased(Student, student_query)
    res = await session.execute(select(ua.id))
    res = res.all()

    students = [r for (r,) in res]

    if orderby:
        sorting = {}
        for key, val in get_sorting(orderby).items():
            res = await session.execute(select(ua.id, QuestionTag.tag, Answer.answer).join(QuestionAnswer, ua.id == QuestionAnswer.student_id).join(QuestionTag, QuestionAnswer.question_id == QuestionTag.question_id).where(QuestionTag.tag == key).join(Answer))
            res = res.all()
            sorting[tuple([r for (_, _, r) in res])] = val

        for k, val in reversed(sorting.items()):
            students = [x for _, x in sorted(zip(list(k), students), reverse=val)]

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


@router.get("/{year}/resolving_conflicts", dependencies=[Depends(RoleChecker(UserRole.ADMIN)), Depends(EditionChecker())], response_description="Students retrieved")
async def get_conflicting_students(year: int):
    """get_conflicting_students gets all students with conflicts in their confirmed suggestions
    within an edition

    :param year: year of the edition
    :type year: int
    :return: list of students with conflicting suggestions
             each entry is a dictionary with keys "student_id" and "suggestion_ids"
    :rtype: dict
    """

    collection = db.engine.get_collection(Suggestion)
    if not collection:
        raise SuggestionRetrieveException()

    students = await db.engine.find(Student, {"edition": year})
    students = [student.id for student in students]
    print(students)

    pipeline = [
        # get confirmed suggestions for students in the current edition that say yes
        {"$match": {
            "definitive": True,
            "student": {"$in": students},
            "decision": SuggestionOption.YES}},
        # group by student_form, create set of suggestions and get count of suggestions
        {"$group": {
            "_id": "$student",
            "suggestion_ids": {"$addToSet": "$_id"},
            "count": {"$sum": 1}}},
        # only match if count of suggestions > 0, since this means there is a conflict
        {"$match": {
            "_id": {"$ne": None},
            "count": {"$gt": 1}}},
        # change field names
        {"$project": {
            "student_id": "$_id",
            "suggestion_ids": 1,
            "_id": 0}}
    ]

    documents = await collection.aggregate(pipeline).to_list(length=None)
    students = []
    for doc in documents:
        students.append(doc)
        students[-1]["student_id"] = str(students[-1]["student_id"])
        students[-1]["suggestion_ids"] = [str(s_id) for s_id in students[-1]["suggestion_ids"]]

    return response(students, "Students with conflicting suggestions retrieved succesfully")
