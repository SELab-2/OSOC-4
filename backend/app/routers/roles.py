from fastapi import APIRouter

from app.crud.base_crud import read_all
from app.models.role import Role
from app.utils.response import list_modeltype_response


router = APIRouter(prefix="/roles")


@router.get("/", response_description="Roles retrieved")
async def get_roles():
    """get_roles get all the Role instances from the database

    :return: list of roles
    :rtype: dict
    """
    results = await read_all(Role)
    list_modeltype_response(results, Role)
