from app.crud import read_all, read_where
from app.models.answer import Answer
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import errorresponse, list_modeltype_response, response
from fastapi import APIRouter, Depends
from odmantic import ObjectId

router = APIRouter(prefix="/answers")


@router.get("/", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Answers retrieved")
async def get_answers():
    """get_answer get all the Answer instances from the database

    :return: list of answers
    :rtype: dict
    """
    results = await read_all(Answer)
    return list_modeltype_response(results, Answer)


@router.get("/{id}", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Answer retrieved")
async def get_answer(id):
    """get_answer get the Answer instance with the given id from the database

    :return: the answer if found, else None
    :rtype: dict
    """
    answer = await read_where(Answer, Answer.id == ObjectId(id))
    if not answer:
        return errorresponse(None, 400, "Answer not found")
    return response(answer, "Returned the answer successfully")
