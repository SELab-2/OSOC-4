""" This module includes the reset password endpoints """

from app.crud import read_where, update
from app.database import db, get_session
from app.exceptions.key_exceptions import InvalidResetKeyException
from app.exceptions.permissions import NotPermittedException
from app.exceptions.user_exceptions import PasswordsDoNotMatchException
from app.models.user import User, UserResetPassword
from app.utils.checkers import check_key
from app.utils.cryptography import get_password_hash
from app.utils.response import response
from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/resetpassword")


@router.get("/{resetkey}")
async def valid_resetkey(resetkey: str, session: AsyncSession = Depends(get_session)) -> dict:
    """valid_resetkey checks whether a resetkey is valid

    :param resetkey: the reset key
    :type resetkey: str
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises InvalidResetKeyException: raised when the reset key isn't valid
    :return: a response message
    :rtype: dict
    """
    valid = await check_key(resetkey, "R", session)
    if valid:
        return response(None, "Valid resetkey")
    else:
        raise InvalidResetKeyException()


@router.post("/{resetkey}")
async def use_resetkey(resetkey: str, reset: UserResetPassword = Body(...),
                       session: AsyncSession = Depends(get_session)) -> dict:
    """use_resetkey uses a resetkey, resets a password

    :param resetkey: the reset key
    :type resetkey: str
    :param reset: the reset data (the old & new passwords), defaults to Body(...)
    :type reset: UserResetPassword, optional
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises InvalidResetKeyException: raised when the reset key isn't valid
    :raises NotPermittedException: unauthorized
    :raises PasswordsDoNotMatchException: raised when the password and the validate password aren't the same
    :return: a response message
    :rtype: dict
    """
    if resetkey[0] != "R":
        raise InvalidResetKeyException()

    userid = db.redis.get(resetkey)  # check that the inv key exists

    if userid:
        user = await read_where(User, User.id == int(userid), session=session)

        if not user:
            raise NotPermittedException()

        if not user.active:
            raise NotPermittedException()

        if reset.password != reset.validate_password:
            raise PasswordsDoNotMatchException()

        user.password = get_password_hash(reset.password)

        await update(user, session=session)
        db.redis.delete(resetkey)

        return response(None, "New password successfully set, you can now login with your new password")

    raise InvalidResetKeyException()
