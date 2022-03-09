from fastapi import APIRouter
from odmantic import ObjectId

from app.crud import read_by_key_value, read_all, update
from app.database import db
from app.models.user import UserInvite, User, UserOut
from app.utils.cryptography import get_password_hash
from app.utils.response import response, errorresponse

router = APIRouter(prefix="/invite")


@router.get("/")
async def get_invites():
    users = await read_all(User)
    u: User
    users = [UserOut.parse_raw(u.json()) for u in users if u.active and not u.approved]
    if users:
        return response(users, "Users retrieved successfully")
    return response(users, "Empty list returned")


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
        return errorresponse(None, 400, "entered passwords are not the same")

    if db.redis.get(invitekey):  # check that the inv key exists

        user: User = await read_by_key_value(User, User.id, ObjectId(invitekey.split("_")[1]))

        if user.active:
            return errorresponse(None, 400, "account already active")

        user.name = userinvite.name
        user.password = get_password_hash(userinvite.password)
        user.active = True
        await update(user)
        db.redis.delete(invitekey)

        return response(None, "User activated successfully")
    else:
        return errorresponse(None, 400, "invite is not valid")
