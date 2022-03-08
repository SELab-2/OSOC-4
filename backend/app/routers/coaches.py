from fastapi import APIRouter

from app.crud.base_crud import read_all
from app.models.coach import Coach
from app.utils.response import list_modeltype_response


router = APIRouter(prefix="/coaches")


@router.get("/", response_description="Coaches retrieved")
async def get_coaches():
    """get_coaches get all the Coach instances from the database

    :return: list of coaches
    :rtype: dict
    """
    results = await read_all(Coach)
    list_modeltype_response(results, Coach)
