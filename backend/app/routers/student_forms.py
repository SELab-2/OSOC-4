from app.crud import read_all
from app.models.student_form import StudentForm
from app.utils.response import list_modeltype_response
from fastapi import APIRouter

router = APIRouter(prefix="/students")


@router.get("/", response_description="Students retrieved")
async def get_student():
    """get_students get all the StudentForm instances from the database

    :return: list of student forms
    :rtype: dict
    """
    results = await read_all(StudentForm)
    return list_modeltype_response(results, StudentForm)
