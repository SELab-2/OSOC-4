from fastapi import APIRouter

from app.crud.base_crud import read_all
from app.models.answer import Answer
from app.utils.response import list_modeltype_response

router = APIRouter(prefix="/answers")


@router.get("/", response_description="Answers retrieved")
async def get_answers():
    """get_answer get all the Answer instances from the database

    :return: list of answers
    :rtype: dict
    """
    results = await read_all(Answer)
    return list_modeltype_response(results, Answer)
