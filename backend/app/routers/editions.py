import datetime
from typing import List, Optional

from app.crud import read_all_where, read_where, update
from app.database import db
from app.exceptions.edition_exceptions import (AlreadyEditionWithYearException,
                                               EditionNotFound,
                                               EditionYearModifyException,
                                               StudentNotFoundException,
                                               SuggestionRetrieveException,
                                               YearAlreadyOverException)
from app.models.edition import Edition
from app.models.project import Project
from app.models.student_form import StudentForm
from app.models.suggestion import Suggestion, SuggestionOption
from app.models.user import UserRole
from app.utils.checkers import EditionChecker, RoleChecker
from app.utils.response import list_modeltype_response, response
from bson import ObjectId
from fastapi import APIRouter, Body, Depends

router = APIRouter(prefix="/editions")


@router.get("/", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Editions retrieved")
async def get_editions():
    """get_editions get all the Edition instances from the database

    :return: list of editions
    :rtype: dict
    """
    results = await read_all_where(Edition)
    return list_modeltype_response(results, Edition)


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Created a new edition")
async def create_edition(edition: Edition = Body(...)):
    """create_edition creates a new edition in the database

    :param edition: defaults to Body(...)
    :type edition: Edition, optional
    :return: data of newly created edition
    :rtype: dict
    """
    if edition.year is None or edition.year == "" or int(edition.year) < datetime.date.today().year:
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
    return response(edition, "Edition successfully retrieved")


@router.post("/{year}", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker())], response_description="Editions retrieved")
async def update_edition(year: int, edition: Edition = Body(...)):
    """update_edition update the Edition instance with given year

    :return: the updated edition
    :rtype: dict
    """
    if not year == edition.year:
        raise EditionYearModifyException()

    results = await read_where(Edition, Edition.id == edition.id)
    if not results:
        raise EditionNotFound()
    return response(results, "Edition successfully retrieved")


@router.get("/{year}/students", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker())], response_description="Students retrieved")
async def get_edition_students(year: int):
    """get_edition_students get all the students in the edition with given year

    :return: list of all the students in the edition with given year
    :rtype: dict
    """
    edition = await read_where(Edition, Edition.year == year)
    if not edition:
        raise EditionNotFound()

    students = await db.engine.find(StudentForm, {"edition": edition.id})
    return list_modeltype_response(students, StudentForm)


@router.post("/{year}/students", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker())], response_description="Students retrieved")
async def get_edition_students_with_filter(
        year: int,
        search: Optional[str] = None,
        role_filter: Optional[List[ObjectId]] = None):
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
    edition = await read_where(Edition, Edition.year == year)
    if not edition:
        raise EditionNotFound()

    query = {"edition": edition.id}
    if search is not None:
        query["name"] = {"$regex": search, "$options": "i"}
    if role_filter is not None and len(role_filter) > 0:
        if len(role_filter) == 1:
            query["roles"] = role_filter[0]
        else:
            query["roles"] = {"$all": role_filter}

    students = await db.engine.find(StudentForm, query)
    return list_modeltype_response(students, StudentForm)


@router.get("/{year}/projects", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker())], response_description="Projects retrieved")
async def get_edition_projects(year: int):
    """get_edition_projects get all the projects in the edition with the given year

    :param year: year of the edition
    :type year: int
    :return: list of projects
    :rtype: dict
    """
    edition = await read_where(Edition, Edition.year == year)
    if not edition:
        raise EditionNotFound()

    projects = await db.engine.find(Project, {"edition": edition.id})
    return list_modeltype_response(projects, Project)


@router.get("/{year}/student/{student_id}", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker())], response_description="Student retrieved")
async def get_student(year: int, student_id: str):
    """get_student get the StudentForm with the corresponding id

    :param year: year of the edition
    :type year: int
    :return: StudentForm
    :rtype: dict
    """
    edition = await read_where(Edition, Edition.year == year)
    if not edition:
        raise EditionNotFound()
    student = await db.engine.find(StudentForm, {"edition": edition.id, "_id": student_id})
    if not student:
        raise StudentNotFoundException()
    return response(student, "Student successfully retrieved")


@router.post("/{year}/student/{student_id}", dependencies=[Depends(RoleChecker(UserRole.COACH)), Depends(EditionChecker())], response_description="Student edited")
async def edit_student(student: StudentForm = Body(...)):
    """edit_student creates or modifies a student in the database

    :param year: year of the edition
    :type year: int
    :param student: defaults to Body(...)
    :type student: StudentForm, optional
    :return: data of newly created student
    :rtype: dict
    """
    new_student = await update(StudentForm.parse_obj(student))
    return response(new_student, "Student added successfully.")


@router.get("/{year}/student/students/resolving_conflicts", dependencies=[Depends(RoleChecker(UserRole.ADMIN)), Depends(EditionChecker())], response_description="Projects retrieved")
async def get_conflicting_students(year: int):
    """get_conflicting_projects gets all students with conflicts in their confirmed suggestions
    within an edition

    :param year: year of the edition
    :type year: int
    :return: list of students with conflicting suggestions
             each entry is a dictionary with keys "student_id" and "suggestion_ids"
    :rtype: dict
    """

    edition = await read_where(Edition, Edition.year == year)
    if not edition:
        raise EditionNotFound()

    collection = db.engine.get_collection(Suggestion)
    if not collection:
        raise SuggestionRetrieveException()

    students = await db.engine.find(StudentForm, {"edition": edition.id})
    students = [student.id for student in students]

    pipeline = [
        # get confirmed suggestions for students in the current edition that say yes
        {"$match": {
            "confirmed": True,
            "student_form": {"$in": students},
            "suggestion": SuggestionOption.YES}},
        # group by student_form, create set of suggestions and get count of suggestions
        {"$group": {
            "_id": "$student_form",
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
