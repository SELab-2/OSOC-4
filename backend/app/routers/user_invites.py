from app.crud import read_where, update
from app.database import db
from app.exceptions.key_exceptions import InvalidInviteException
from app.exceptions.permissions import NotPermittedException
from app.exceptions.user_exceptions import (PasswordsDoNotMatchException,
                                            UserAlreadyActiveException)
from app.models.user import User, UserInvite
from app.utils.cryptography import get_password_hash
from app.utils.response import response
from app.utils.validators import valid_password
from fastapi import APIRouter
from odmantic import ObjectId

router = APIRouter(prefix="/invite")


@router.get("/{invitekey}")
async def check_invite(invitekey: str):
    """get_invite: returns whether an invite exists or not

    :param invitekey: key for the invite to identify the user
    :return: response
    :rtype: succes or error
    """
    if db.redis.get(invitekey):
        return response(None, "User activated successfully")
    else:
        raise InvalidInviteException()


@router.post("/{invitekey}")
async def invited_user(invitekey: str, userinvite: UserInvite):
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
        user: User = await read_where(User, User.id == ObjectId(userid))

        if not user:
            raise NotPermittedException()

        if user.active:
            raise UserAlreadyActiveException()

        if userinvite.password != userinvite.validate_password:
            raise PasswordsDoNotMatchException()

        user.name = userinvite.name
        user.password = get_password_hash(userinvite.password)

        user.active = True
        await update(user)
        db.redis.delete(invitekey)

        return response(None, "User activated successfully")

    raise InvalidInviteException()
