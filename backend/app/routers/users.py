from fastapi import APIRouter
from app.models.user import User, UserCreate, UserOut
from app.utils.response import response, errorresponse
from app.crud.users import add_user, get_user_by_id, retrieve_users, get_user_by_email
from app.crud.userinvites import create_invite
from app.utils.mailsender import send_invite

router = APIRouter(prefix="/users")


@router.post("/create", response_description="User data added into the database")
async def add_user_data(user: UserCreate):
    """add_user_data add a new user

    :param user: defaults to Body(...)
    :type user: User, optional
    :return: data of new created user
    :rtype: dict
    """

    # check if email already used
    if await get_user_by_email(user.email):
        return errorresponse("Email already used", 409, "")

    new_user = await add_user(User.parse_obj(user))
    return response(new_user, "User added successfully.")


@router.get("/", response_description="Users retrieved")
async def get_users():
    """get_users get all the users from the database

    :return: list of users
    :rtype: dict
    """
    users = await retrieve_users()
    out_users = []
    for user in users:
        out_users.append(UserOut.parse_raw(user.json()))
    if out_users:
        return response(out_users, "Users retrieved successfully")
    return response(out_users, "Empty list returned")


@router.post("/{id}/invite")
async def invite_user(id: str):
    """invite_user this functions invites a user

    :param id: the user id
    :type id: str
    :return: response
    :rtype: success or error
    """
    user = await get_user_by_id(id)

    if user.active:
        return errorresponse(None, 400, "The user is already active")

    invitekey = create_invite(user)

    send_invite(user.email, invitekey)
    return response(None, "Invite sent succesfull")
