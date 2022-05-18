from typing import List

from app.crud import read_where
from app.database import db, get_session
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
    """ Object to check if user is allowed to perform an action
    """
    def __init__(self, role: UserRole):
        """__init__ save the minimum required permission

        :param role: minimim required permission
        :type role: UserRole
        """
        self.role = role

    async def __call__(self, Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)) -> UserRole:
        """__call__ called when a request is received

        :param Authorize: AuthJWT object
        :type Authorize: AuthJWT, optional
        :param session: session used for database operations
        :type session: AsyncSession, optional
        :raises NotPermittedException: Exception that user is not allowed to perform this action
        :return: the role of the user
        :rtype: UserRole
        """

        Authorize.jwt_required()

        current_user_id = Authorize.get_jwt_subject()
        user = await read_where(User, User.id == int(current_user_id), session=session)

        if not user.approved or user.disabled or user.role < self.role:
            raise NotPermittedException()

        return user.role


class EditionChecker:
    """ Object to check if a user is allowed to the do action on the edition
    """
    def __init__(self, always_allowed: List[UserRole] = [UserRole.ADMIN], update: bool = False):
        """__init__ set the always allowed userroles and set if the action wants to update the edition

        :param always_allowed: allowed userroles, defaults to [UserRole.ADMIN]
        :type always_allowed: List[UserRole], optional
        :param update: action wants to update the edition, defaults to False
        :type update: bool, optional
        """
        self.always_allowed = always_allowed
        self.update = update

    async def __call__(self, year: str, Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)) -> Edition:
        """__call__ calles when request is receiveed

        :param year: the year of the edition where action is performed on
        :type year: str
        :param Authorize: AuthJWT
        :type Authorize: AuthJWT, optional
        :param session: session used for database operations
        :type session: AsyncSession, optional
        :raises NotPermittedException: Exception when user is not allowed to perform action
        :raises EditionNotFound: Exception when edition is not found
        :return: the edition where action is performed on
        :rtype: Edition
        """

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


async def check_key(key: str, key_identifier: str, session: AsyncSession) -> bool:
    """ check if the key exists in the redis database

    :return: check if user exists for key
    :rtype: bool
    """

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
