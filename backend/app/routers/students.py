from app.crud import read_where, read_all_where
from app.models.student import Student, StudentOutSimple, StudentOutExtended
from app.utils.response import list_modeltype_response
from fastapi import APIRouter
from odmantic import ObjectId

router = APIRouter(prefix="/students")


@router.get("/", response_description="Students retrieved")
async def get_students():
    """get_students get all the Student instances from the database

    :return: list of students
    :rtype: dict
    """
    results = await read_all_where(Student)
    print(results)
    return list_modeltype_response([StudentOutSimple.parse_raw(r.json()) for r in results], Student)


@router.get("/{id}", response_description="Student retrieved")
async def get_student():
    """get_student get the Student instances with id from the database

    :return: student with id
    :rtype: StudentOutExtended
    """
    result = await read_where(Student, Student.id == ObjectId(id))
    return list_modeltype_response(StudentOutExtended.parse_raw(result.json()), Student)
