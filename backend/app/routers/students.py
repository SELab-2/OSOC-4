from app.crud import read_all_where, read_where
from app.models.student import Student, StudentOutExtended, StudentOutSimple
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import list_modeltype_response
from fastapi import APIRouter, Depends
from odmantic import ObjectId

router = APIRouter(prefix="/students")


@router.get("/", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Students retrieved")
async def get_students():
    """get_students get all the Student instances from the database

    :return: list of students
    :rtype: dict
    """
    results = await read_all_where(Student)
    return list_modeltype_response([StudentOutSimple.parse_raw(r.json()).id for r in results], Student)


@router.get("/{student_id}", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Student retrieved")
async def get_student(student_id):
    """get_student get the Student instances with id from the database

    :return: student with id
    :rtype: StudentOutExtended
    """
    result = await read_where(Student, Student.id == ObjectId(student_id))
    return list_modeltype_response(StudentOutExtended.parse_raw(result.json()), Student)
