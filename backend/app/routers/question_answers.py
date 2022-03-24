from app.crud import read_all_where
from app.models.question_answer import QuestionAnswer
from app.utils.response import list_modeltype_response
from fastapi import APIRouter

router = APIRouter(prefix="/question_answers")


@router.get("/", response_description="Questions retrieved")
async def get_question_answers():
    """get_question_answers get all the QuestionAnswer instances from the database

    :return: list of question answers
    :rtype: dict
    """
    results = await read_all_where(QuestionAnswer)
    return list_modeltype_response(results, QuestionAnswer)
