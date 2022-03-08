from fastapi import APIRouter

from app.crud.base_crud import read_all
from app.models.question import Question
from app.utils.response import list_modeltype_response


router = APIRouter(prefix="/questions")


@router.get("/", response_description="Questions retrieved")
async def get_questions():
    """get_questions get all the Question instances from the database

    :return: list of projects
    :rtype: dict
    """
    results = await read_all(Question)
    return list_modeltype_response(results, Question)
