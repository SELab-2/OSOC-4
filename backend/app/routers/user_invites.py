""" This module includes the user invite endpoints """

from app.crud import read_where, update
from app.database import db, get_session
from app.exceptions.key_exceptions import InvalidInviteException
from app.exceptions.permissions import NotPermittedException
from app.exceptions.user_exceptions import (PasswordsDoNotMatchException,
                                            UserAlreadyActiveException)
from app.models.user import User, UserInvite
from app.utils.checkers import check_key
from app.utils.cryptography import get_password_hash
from app.utils.response import response
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/invite")


@router.get("/{invitekey}")
async def valid_invitekey(invitekey: str, session: AsyncSession = Depends(get_session)) -> dict:
    """valid_invitekey checks whether an invitekey is valid

    :param invitekey: the invitekey
    :type invitekey: str
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises InvalidInviteException: raised when the invitekey isn't valid
    :return: response message
    :rtype: dict
    """
    valid: bool = await check_key(invitekey, "I", session)
    if valid:
        return response(None, "Valid invitekey")
    else:
        raise InvalidInviteException()


@router.post("/{invitekey}")
async def invited_user(invitekey: str, userinvite: UserInvite, session: AsyncSession = Depends(get_session)) -> dict:
    """invited_user this processes the passwords from the userinvite

    :param invitekey: key for the invite to identify the user
    :type invitekey: str
    :param userinvite: input model for the request
    :type userinvite: UserInvite
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises InvalidInviteException: raised if the invitekey isn't valid
    :raises NotPermittedException: unauthorized
    :raises UserAlreadyActiveException: the user is already active
    :raises PasswordsDoNotMatchException: the password and validation password are not the same
    :return: response message
    :rtype: dict
    """

    if invitekey[0] != "I":
        raise InvalidInviteException()

    userid = db.redis.get(invitekey)  # check that the inv key exists

    if userid:
        user: User = await read_where(User, User.id == int(userid), session=session)

        if not user:
            raise NotPermittedException()

        if user.active:
            raise UserAlreadyActiveException()

        if userinvite.password != userinvite.validate_password:
            raise PasswordsDoNotMatchException()

        user.name = userinvite.name
        user.password = get_password_hash(userinvite.password)

        user.active = True
        await update(user, session=session)
        db.redis.delete(invitekey)

        return response(None, "User activated successfully")

    raise InvalidInviteException()
