from fastapi import APIRouter

from app.crud import read_all
from app.models.student_form import StudentForm
from app.utils.response import list_modeltype_response


router = APIRouter(prefix="/student_forms")


@router.get("/", response_description="Questions retrieved")
async def get_student_forms():
    """get_student_forms get all the StudentForm instances from the database

    :return: list of student forms
    :rtype: dict
    """
    results = await read_all(StudentForm)
    return list_modeltype_response(results, StudentForm)
