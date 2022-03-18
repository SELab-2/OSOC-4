from app.crud import read_all_where
from app.models.question import Question
from app.utils.response import list_modeltype_response
from fastapi import APIRouter

router = APIRouter(prefix="/questions")


@router.get("/", response_description="Questions retrieved")
async def get_questions():
    """get_questions get all the Question instances from the database

    :return: list of projects
    :rtype: dict
    """
    results = await read_all_where(Question)
    return list_modeltype_response(results, Question)
