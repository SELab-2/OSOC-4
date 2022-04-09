from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import read_where, update
from app.database import db, get_session
from app.exceptions.key_exceptions import InvalidInviteException
from app.exceptions.permissions import NotPermittedException
from app.exceptions.user_exceptions import (PasswordsDoNotMatchException,
                                            UserAlreadyActiveException)
from app.models.user import User, UserInvite
from app.utils.cryptography import get_password_hash
from app.utils.response import response
from fastapi import APIRouter, Depends
from odmantic import ObjectId

router = APIRouter(prefix="/invite")


@router.get("/{invitekey}")
async def valid_invitekey(invitekey: str):
    if invitekey[0] != "I":
        raise InvalidInviteException()
    userid = db.redis.get(invitekey)
    if userid is None:
        raise InvalidInviteException()
    return response(None, "Valid invitekey")


@router.post("/{invitekey}")
async def invited_user(invitekey: str, userinvite: UserInvite, session: AsyncSession = Depends(get_session)):
    """invited_user this processes the passwords from the userinvite

    :param invitekey: key for the invite to identify the user
    :type invitekey: str
    :param userinvite: input model for request
    :type userinvite: UserInvite
    :return: response
    :rtype: success or error
    """

    if invitekey[0] != "I":
        raise InvalidInviteException()

    userid = db.redis.get(invitekey)  # check that the inv key exists

    if userid:
        user = await read_where(User, User.id == int(userid), session=session)

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
