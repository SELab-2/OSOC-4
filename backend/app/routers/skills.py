from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import read_all_where
from app.database import get_session
from app.models.skill import Skill
from app.models.user import UserRole
from app.utils.checkers import RoleChecker

router = APIRouter(prefix="/skills")


@router.get("", response_description="Skills retrieved", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def get_skills(session: AsyncSession = Depends(get_session)) -> List[str]:
    """get_skills get all the Skill instances from the database

    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :return: list of skills
    :rtype: List[str]
    """

    results = await read_all_where(Skill, session=session)
    return [r.name for r in results]
