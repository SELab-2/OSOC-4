from app.crud import read_all_where
from app.models.participation import Participation
from app.utils.response import list_modeltype_response
from fastapi import APIRouter

router = APIRouter(prefix="/paticipations")


@router.get("/", response_description="Participations retrieved")
async def get_participations():
    """get_participations get all the Participation instances from the database

    :return: list of participations
    :rtype: dict
    """
    results = await read_all_where(Participation)
    return list_modeltype_response(results, Participation)
