from fastapi import APIRouter

from app.crud.base_crud import read_all
from app.models.suggestion import Suggestion
from app.utils.response import list_modeltype_response


router = APIRouter(prefix="/suggestions")


@router.get("/", response_description="Suggestions retrieved")
async def get_suggestions():
    """get_suggestions get all the Suggestion instances from the database

    :return: list of suggestions
    :rtype: dict
    """
    results = await read_all(Suggestion)
    return list_modeltype_response(results, Suggestion)
