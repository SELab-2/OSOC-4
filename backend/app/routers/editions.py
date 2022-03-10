from app.crud import read_all
from app.models.edition import Edition
from app.utils.response import list_modeltype_response
from fastapi import APIRouter

router = APIRouter(prefix="/editions")


@router.get("/", response_description="Editions retrieved")
async def get_editions():
    """get_editions get all the Edition instances from the database

    :return: list of editions
    :rtype: dict
    """
    results = await read_all(Edition)
    return list_modeltype_response(results, Edition)
