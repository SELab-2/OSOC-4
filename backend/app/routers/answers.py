from odmantic import ObjectId

from app.crud import read_all, read_by_key_value
from app.models.answer import Answer
from app.models.user import UserRole
from app.utils.response import list_modeltype_response, errorresponse, response
from fastapi import APIRouter, Depends

from app.utils.rolechecker import RoleChecker

router = APIRouter(prefix="/answers")


@router.get("/", dependencies=[Depends(RoleChecker([UserRole.COACH]))], response_description="Answers retrieved")
async def get_answers():
    """get_answer get all the Answer instances from the database

    :return: list of answers
    :rtype: dict
    """
    results = await read_all(Answer)
    return list_modeltype_response(results, Answer)


@router.get("/{id}", dependencies=[Depends(RoleChecker([UserRole.COACH]))], response_description="Answer retrieved")
def get_answer(id):
    """get_partner get the Partner instance with the given id from the database

    :return: the partner if found, else None
    :rtype: dict
    """
    partner = await read_by_key_value(Answer, Answer.id, ObjectId(id))
    if not partner:
        return errorresponse(None, 400, "Partner not found")
    return response(partner, "Returned the partner successfully")
