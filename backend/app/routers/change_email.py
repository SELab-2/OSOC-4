""" This module includes the change email endpoints """

from app.crud import read_where, update
from app.database import db, get_session
from app.exceptions.key_exceptions import InvalidChangeKeyException
from app.exceptions.permissions import NotPermittedException
from app.exceptions.user_exceptions import (PasswordsDoNotMatchException,
                                            UserAlreadyActiveException)
from app.models.user import User, UserInvite
from app.utils.checkers import check_key
from app.utils.cryptography import get_password_hash
from app.utils.response import response
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/change")

@router.get("/{changekey}")
async def valid_changekey(changekey: str, session: AsyncSession = Depends(get_session)) -> dict:
    """valid_changekey checks whether an emailkey is valid

    :param ch: the changekey
    :type changekey: str
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises InvalidInviteException: raised when the invitekey isn't valid
    :return: response message
    :rtype: dict
    """
    valid: bool = await check_key(changekey, "C", session)
    if valid:
        return response(None, "Valid change email key")
    else:
        raise InvalidChangeKeyException()