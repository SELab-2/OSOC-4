import datetime
from typing import List, Optional

from app.crud import read_all_where, read_where, update
from app.database import db, get_session
from app.exceptions.edition_exceptions import (AlreadyEditionWithYearException,
                                               EditionNotFound,
                                               EditionYearModifyException,
                                               SuggestionRetrieveException,
                                               YearAlreadyOverException)
from app.models.edition import Edition, EditionOutExtended, EditionOutSimple
from app.models.project import Project, ProjectCoach, ProjectOutSimple
from app.models.student import Student
from app.models.suggestion import Suggestion, SuggestionOption
from app.models.user import UserRole
from app.utils.checkers import EditionChecker, RoleChecker
from app.utils.response import list_modeltype_response, response
from fastapi import APIRouter, Body, Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

router = APIRouter(prefix="/editions")


@router.get("", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Editions retrieved")
async def get_editions():
    """get_editions get all the Edition instances from the database

    :return: list of editions
    :rtype: dict
    """
    results = await read_all_where(Edition)
    return list_modeltype_response([EditionOutSimple.parse_raw(r.json()) for r in results], Edition)


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Created a new edition")
async def create_edition(edition: Edition = Body(...)):
    """create_edition creates a new edition in the database

    :param edition: defaults to Body(...)
    :type edition: Edition, optional
    :return: data of newly created edition
    :rtype: dict
    """
    if int(edition.year) < datetime.date.today().year:
        raise YearAlreadyOverException()
    # check if an edition with the same year is already present
    if await read_where(Edition, Edition.year == edition.year):
        raise AlreadyEditionWithYearException(edition.year)

    new_edition = await update(Edition.parse_obj(edition))
    return response(new_edition, "Edition added successfully.")


@router.get("/{year}", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker())], response_description="Editions retrieved")
async def get_edition(year: int):
    """get_edition get the Edition instance with given year

    :return: list of editions
    :rtype: dict
    """
    edition = await read_where(Edition, Edition.year == year)
    if not edition:
        raise EditionNotFound()
    return response(EditionOutExtended.parse_raw(edition.json()), "Edition successfully retrieved")


@router.post("/{year}", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker())], response_description="Editions retrieved")
async def update_edition(year: int, edition: Edition = Body(...)):
    """update_edition update the Edition instance with given year

    :return: the updated edition
    :rtype: dict
    """
    if not year == edition.year:
        raise EditionYearModifyException()

    result = await read_where(Edition, Edition.year == edition.year)
    if not result:
        raise EditionNotFound()
    return response(EditionOutExtended.parse_raw(result.json()), "Edition successfully retrieved")


@router.get("/{year}/students", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker())], response_description="Students retrieved")
async def get_edition_students(year: int):
    """get_edition_students get all the students in the edition with given year

    :return: list of all the students in the edition with given year
    :rtype: dict
    """
    students = await db.engine.find(Student, {"edition": year})
    return list_modeltype_response(students, Student)


@router.post("/{year}/students", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker())], response_description="Students retrieved")
async def get_edition_students_with_filter(
        year: int,
        search: Optional[str] = None,
        role_filter: Optional[List[int]] = None):
    """get_edition_students_with_filter get all the students in the edition with given year and filters

    :param year: year of the edition
    :type year: int
    :param search: search term to search for students
    :type search: str
    :param role_filter: roles which the student should have
    :type role_filter: Optional[List[ObjectId]]
    :return: list of all the students matching the criteria
    :rtype: dict
    """
    query = {"edition": year}
    if search is not None:
        query["name"] = {"$regex": search, "$options": "i"}
    if role_filter is not None and len(role_filter) > 0:
        if len(role_filter) == 1:
            query["roles"] = role_filter[0]
        else:
            query["roles"] = {"$all": role_filter}

    students = await db.engine.find(Student, query)
    return list_modeltype_response(students, Student)


@router.get("/{year}/projects", response_description="Projects retrieved")
async def get_edition_projects(year: int, role: RoleChecker(UserRole.COACH) = Depends(), session: AsyncSession = Depends(get_session), Authorize: AuthJWT = Depends()):
    """get_projects get all the Project instances from the database

    :return: list of projects
    :rtype: dict
    """
    if role == UserRole.ADMIN:
        print(year)
        results = await read_all_where(Project, Project.edition == year, session=session)
    else:
        Authorize.jwt_required()
        current_user_id = Authorize.get_jwt_subject()
        stat = select(Project).select_from(ProjectCoach).where(ProjectCoach.coach_id == int(current_user_id)).join(Project).where(Project.edition == int(year))
        res = await session.execute(stat)
        results = [r for (r,) in res.all()]
    return list_modeltype_response([ProjectOutSimple.parse_raw(r.json()) for r in results], Project)


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
