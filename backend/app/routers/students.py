from app.crud import read_where
from app.database import db
from app.models.skill import Skill
from app.models.student import Student, StudentOutExtended, StudentOutSimple
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import list_modeltype_response
from fastapi import APIRouter, Depends
from odmantic import ObjectId

router = APIRouter(prefix="/students")


def get_sorting(sortstr: str):
    sorting = [t.split("+") if "+" in t else [t, "asc"] for t in sortstr.split(",")]
    return {t[0]: 1 if t[1] == "asc" else -1 for t in sorting}


@router.get("/", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Students retrieved")
async def get_students(orderby: str = "name+asc", skills: str = "", alumn: bool = None, search: str = "a"):
    """get_students get all the Student instances from the database

    :query parameters:
        :orderby -> str of keys of student + direction to sort by

    :return: list of students
    :rtype: dict
    """

    students = db.engine.get_collection(Student)

    pipeline = []
    if skills:
        skill_ids = [(await read_where(Skill, Skill.name == skill)).id for skill in skills.split(",")]
        pipeline.append({"$match": {"skills": {"$in": skill_ids}}})
    if alumn is not None:
        pipeline.append({"$match": {"alumn": alumn}})

    if orderby:
        pipeline.append({"$sort": get_sorting(orderby)})

    documents = await students.aggregate(pipeline).to_list(length=None)
    print(documents)
    return list_modeltype_response([StudentOutSimple.parse_raw(Student.parse_doc(doc).json()).id for doc in documents], Student)


@router.get("/{student_id}", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Student retrieved")
async def get_student(student_id):
    """get_student get the Student instances with id from the database

    :return: student with id
    :rtype: StudentOutExtended
    """
    result = await read_where(Student, Student.id == ObjectId(student_id))
    return list_modeltype_response(StudentOutExtended.parse_raw(result.json()), Student)
