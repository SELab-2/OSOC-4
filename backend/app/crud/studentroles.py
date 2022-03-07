from typing import List, Optional

from odmantic import ObjectId
from ..database import engine
from ..models.role import Role


async def add_get_role(role: Role) -> Role:
    a = await get_role(role)
    if not a:
        a = await add_role(role)
    return a


async def add_role(role: Role) -> Role:
    a = await engine.save(role)
    return a


async def get_role(role: Role) -> Optional[Role]:
    a = await engine.find_one(Role, Role.name == role.name)
    if a:
        return a
    return None


async def get_all_roles() -> List[Role]:
    res = await engine.find(Role, sort=Role.name.asc())
    return res
