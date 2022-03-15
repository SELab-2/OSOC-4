from app.crud import read_where, update
from app.database import db
from app.exceptions.key_exceptions import InvalidInviteException
from app.exceptions.user_exceptions import PasswordsDoNotMatchException
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

    if userinvite.password != userinvite.validate_password:
        raise PasswordsDoNotMatchException()

    if db.redis.get(invitekey):  # check that the inv key exists

        user: User = await read_where(User, User.id == ObjectId(invitekey.split("_")[1]))

        if user.active:
            raise InvalidInviteException()

        user.name = userinvite.name
        user.password = get_password_hash(userinvite.password)
        user.active = True
        await update(user)
        db.redis.delete(invitekey)

        return response(None, "User activated successfully")
    else:
        raise InvalidInviteException()
