""" This module includes the confirm email endpoints """

from app.crud import read_where, update
from app.database import db, get_session
from app.exceptions.key_exceptions import InvalidConfirmKeyException
from app.utils.checkers import check_key
from app.utils.response import response
from app.models.user import UserResetEmail
from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserResetPassword
from app.exceptions.permissions import NotPermittedException


router = APIRouter(prefix="/confirm")

@router.get("/{confirmkey}")
async def valid_confirmkey(confirmkey: str, session: AsyncSession = Depends(get_session)) -> dict:
    """valid_confirmkey checks whether an emailkey is valid

    :param ch: the confirmkey
    :type confirmkey: str
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises InvalidInviteException: raised when the invitekey isn't valid
    :return: response message
    :rtype: dict
    """

    valid = await check_key(confirmkey, "X", session)
    if valid:
        return response(None, "Valid confirm email key")
    else:
        raise InvalidConfirmKeyException()