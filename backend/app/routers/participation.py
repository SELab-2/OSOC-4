from fastapi import APIRouter

from app.crud import read_all
from app.models.participation import Participation
from app.utils.response import list_modeltype_response


router = APIRouter(prefix="/paticipations")


@router.get("/", response_description="Participations retrieved")
async def get_participations():
    """get_participations get all the Participation instances from the database

    :return: list of participations
    :rtype: dict
    """
    results = await read_all(Participation)
    return list_modeltype_response(results, Participation)
