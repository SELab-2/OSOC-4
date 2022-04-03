from app.crud import read_all_where, read_where
from app.database import get_session
from app.models.answer import Answer
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import errorresponse, response
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/answers")


@router.get("", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Answers retrieved")
async def get_answers(session: AsyncSession = Depends(get_session)):
    """get_answer get all the Answer instances from the database

    :return: list of answers
    :rtype: dict
    """
    results = await read_all_where(Answer, session=session)
    return results


@router.get("/{id}", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Answer retrieved")
async def get_answer(id, session: AsyncSession = Depends(get_session)):
    """get_answer get the Answer instance with the given id from the database

    :return: the answer if found, else None
    :rtype: dict
    """
    answer = await read_where(Answer, Answer.id == id, session=session)
    if not answer:
        return errorresponse(None, 400, "Answer not found")
    return response(answer, "Returned the answer successfully")
