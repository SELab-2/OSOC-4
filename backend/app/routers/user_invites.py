from fastapi import APIRouter

from app.crud.base_crud import read_by_key_value
from app.crud.userinvites import delete_invite, invite_exists
from app.crud.users import set_user_password, set_user_active
from app.models.user import UserInvite, User
from app.utils.response import response, errorresponse

router = APIRouter(prefix="/invite")


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

    if invite_exists(invitekey):

        user = await read_by_key_value(User, User.id, invitekey.split("_")[1])

        if user.active:
            return errorresponse(None, 400, "account already active")

        user = await set_user_password(user, userinvite.password)
        user = await set_user_active(user, True)
        delete_invite(invitekey)

        return response(None, "User created successfully")
    else:
        return errorresponse(None, 400, "invite is not valid")
