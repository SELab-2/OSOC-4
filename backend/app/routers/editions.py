from fastapi import APIRouter

from app.crud.base_crud import read_all
from app.models.edition import Edition
from app.utils.response import response
router = APIRouter(prefix="/editions")


@router.get("/", response_description="Editions retrieved")
async def get_editions():
    """get_editions get all the editions from the database

    :return: list of editions
    :rtype: dict
    """
    editions = await read_all(Edition)
    if editions:
        return response(editions, "Partners retrieved successfully")
    return response(editions, "Empty list returned")

