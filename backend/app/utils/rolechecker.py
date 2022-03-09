from typing import List

from app.crud import read_by_key_value
from app.models.user import User, UserRole
from fastapi import Depends, HTTPException, status
from fastapi_jwt_auth import AuthJWT
from odmantic import ObjectId


class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    async def __call__(self, Authorize: AuthJWT = Depends()):

        try:
            Authorize.jwt_required()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        current_user_id = Authorize.get_jwt_subject()
        user = await read_by_key_value(User, User.id, ObjectId(current_user_id))

        if user.role not in self.allowed_roles:
            print(
                f"User with role {user.role} not in {self.allowed_roles}")
            raise HTTPException(
                status_code=403, detail="Operation not permitted")
