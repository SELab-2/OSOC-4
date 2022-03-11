from typing import List

from app.crud import read_by_key_value
from app.exceptions.permissions import NotPermittedException
from app.models.edition import Edition
from app.models.user import User, UserRole
from fastapi import Depends
from fastapi_jwt_auth import AuthJWT
from odmantic import ObjectId


class RoleChecker:
    def __init__(self, role: UserRole):
        self.role = role

    async def __call__(self, Authorize: AuthJWT = Depends()):

        Authorize.jwt_required()

        current_user_id = Authorize.get_jwt_subject()
        user = await read_by_key_value(User, User.id, ObjectId(current_user_id))

        if user.role < self.role:
            raise NotPermittedException()


class EditionChecker:
    def __init__(self, always_allowed: List[UserRole] = [UserRole.ADMIN]):
        self.always_allowed = always_allowed

    async def __call__(self, year: str, Authorize: AuthJWT = Depends()):

        Authorize.jwt_required()

        current_user_id = Authorize.get_jwt_subject()
        user = await read_by_key_value(User, User.id, ObjectId(current_user_id))

        if user.role not in self.always_allowed:
            edition = await read_by_key_value(Edition, Edition.year, int(year))
            if current_user_id not in edition.user_ids:
                raise NotPermittedException()
