from fastapi import APIRouter, Body
from ..models.user import User
from fastapi.encoders import jsonable_encoder
from ..models.response import Response, ErrorResponse
from ..crud.users import add_user, retrieve_users, get_user_by_username

router = APIRouter(prefix="/users")


@router.post("/create", response_description="User data added into the database")
async def add_user_data(user: User = Body(...)):
    """add_user_data add a new user

    :param user: defaults to Body(...)
    :type user: User, optional
    :return: data of new created user
    :rtype: dict
    """
    user = jsonable_encoder(user)

    # check if username already used
    if await get_user_by_username(user["username"]):
        return ErrorResponse("Username already used", 409, "")

    new_user = await add_user(user)
    return Response(new_user, "User added successfully.")


@router.get("/", response_description="Users retrieved")
async def get_users():
    """get_users get all the users from the database

    :return: list of users
    :rtype: dict
    """
    users = await retrieve_users()
    if users:
        return Response(users, "Users retrieved successfully")
    return Response(users, "Empty list returned")
