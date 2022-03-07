from fastapi import APIRouter, Body
from app.crud.users import get_user_by_id, set_user_password, set_user_valid
from app.models.user import User, UserCreate, UserInvite, UserOut
from fastapi.encoders import jsonable_encoder
from app.utils.response import response, errorresponse
from app.crud.userinvites import delete_invite, invite_exists

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

        user = get_user_by_id(invitekey.split("_")[1])

        if user.active:
            return errorresponse(None, 400, "account already active")

        user = set_user_password(user, userinvite.password)
        user = set_user_valid(user, True)
        delete_invite(invitekey)

        return response(None, "User created successfully")
    else:
        return errorresponse(None, 400, "invite is not valid")
