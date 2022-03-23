from app.crud import read_all_where
from app.models.skill import Skill
from app.utils.response import list_modeltype_response
from fastapi import APIRouter

router = APIRouter(prefix="/roles")


@router.get("/", response_description="Roles retrieved")
async def get_roles():
    """get_roles get all the Role instances from the database

    :return: list of roles
    :rtype: dict
    """
    results = await read_all_where(Skill)
    return list_modeltype_response(results, Skill)
