""" This module includes the change email endpoints """

from app.crud import read_where, update
from app.database import db, get_session
from app.exceptions.key_exceptions import InvalidChangeKeyException
from app.utils.checkers import check_key
from app.utils.response import response
from app.models.user import UserResetEmail
from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserResetPassword
from app.exceptions.permissions import NotPermittedException

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
    print(changekey)
    valid = await check_key(changekey, "C", session)
    if valid:
        return response(None, "Valid change email key")
    else:
        raise InvalidChangeKeyException()

@router.post("/{changekey}")
async def use_changekey(changekey: str, data: UserResetEmail = Body(...),
                       session: AsyncSession = Depends(get_session)) -> dict:
    """use_changekey uses a changekey, changes the users email

    :param use_changekey: the reset key
    :type use_changekey: str
    :param data: the change data (the new email passwords), defaults to Body(...)
    :type data: UserResetEmail, optional
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises InvalidChangeKeyException: raised when the change key isn't valid
    :raises NotPermittedException: unauthorized
    :return: a response message
    :rtype: dict
    """
    print("Hier geraakt")
    if changekey[0] != "C":
        raise InvalidChangeKeyException()

    userid = db.redis.get(changekey)  # check that the inv key exists

    if userid:
        user = await read_where(User, User.id == int(userid), session=session)

        if not user:
            raise NotPermittedException()

        if not user.active:
            raise NotPermittedException()

        user.email = data.email

        await update(user, session=session)
        db.redis.delete(changekey)

        return response(None, "New email successfully set, you can now login with your new email")

    raise InvalidChangeKeyException()