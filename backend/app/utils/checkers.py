from typing import List

from app.crud import read_where
from app.database import get_session, db
from app.exceptions.edition_exceptions import EditionNotFound
from app.exceptions.permissions import NotPermittedException
from app.models.edition import Edition
from app.models.user import User, UserRole
from fastapi import Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select


class RoleChecker:
    def __init__(self, role: UserRole):
        self.role = role

    async def __call__(self, Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)):

        Authorize.jwt_required()

        current_user_id = Authorize.get_jwt_subject()
        user = await read_where(User, User.id == int(current_user_id), session=session)

        if not user.approved:
            raise NotPermittedException()

        if user.disabled:
            raise NotPermittedException()

        if user.role < self.role:
            raise NotPermittedException()

        return user.role


class EditionChecker:
    def __init__(self, always_allowed: List[UserRole] = [UserRole.ADMIN], update: bool = False):
        self.always_allowed = always_allowed
        self.update = update

    async def __call__(self, year: str, Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)):

        Authorize.jwt_required()

        current_user_id = Authorize.get_jwt_subject()
        user = await read_where(User, User.id == int(current_user_id), session=session)

        stat = select(Edition).where(Edition.year == int(year)).options(selectinload(Edition.coaches))
        res = await session.execute(stat)
        (edition,) = res.one()

        if (self.update and edition.read_only) or (user.role not in self.always_allowed and user not in edition.coaches):
            raise NotPermittedException()

        if not edition:
            raise EditionNotFound()

        return edition


async def check_key(key: str, key_identifier: str, session: AsyncSession):
    if key[0] != key_identifier:  # check identifier
        return False

    uid = db.redis.get(key)
    try:  # make sure uid is an int
        uid = int(uid)
    except ValueError:
        return False

    if uid <= 0:  # make sure uid is a valid id
        return False

    user = await read_where(User, User.id == uid, session=session)

    # make sure user exists
    return user is not None
