from app.crud import read_all_where
from app.models.skill import Skill
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import list_modeltype_response
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/skills")


@router.get("", response_description="Skills retrieved", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def get_skills():
    """get_roles get all the Skill instances from the database

    :return: list of skills
    :rtype: dict
    """
    results = await read_all_where(Skill)
    return list_modeltype_response(results, Skill)