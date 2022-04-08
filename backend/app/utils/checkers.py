from typing import List

from app.crud import read_where
from app.database import get_session
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
        print(current_user_id)
        user = await read_where(User, User.id == int(current_user_id), session=session)

        if not user.approved:
            raise NotPermittedException()

        if user.disabled:
            raise NotPermittedException()

        if user.role < self.role:
            raise NotPermittedException()

        return user.role


class EditionChecker:
    def __init__(self, always_allowed: List[UserRole] = [UserRole.ADMIN]):
        self.always_allowed = always_allowed

    async def __call__(self, year: str, Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)):

        Authorize.jwt_required()

        current_user_id = Authorize.get_jwt_subject()
        user = await read_where(User, User.id == int(current_user_id), session=session)

        stat = select(Edition).where(Edition.year == int(year)).options(selectinload(Edition.coaches))
        res = await session.execute(stat)
        (edition,) = res.one()

        if user.role not in self.always_allowed:
            if user not in edition.coaches:
                raise NotPermittedException()

        if not edition:
            raise EditionNotFound()

        return edition
