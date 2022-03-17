from typing import List
from app.crud import read_all, read_by_key_value, update
from app.database import db
from app.exceptions.user_exceptions import (EmailAlreadyUsedException,
                                            InvalidEmailException,
                                            UserAlreadyActiveException,
                                            UserNotFoundException)
from app.models.user import User, UserCreate, UserOut, UserRole
from app.utils.checkers import RoleChecker
from app.utils.invite import generate_new_invite_key
from app.utils.mailsender import send_invite
from app.utils.response import errorresponse, list_modeltype_response, response
from app.utils.validators import valid_email
from bson import ObjectId
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/users")


@router.get("/", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Users retrieved")
async def get_users():
    """get_users get all the users from the database

    :return: list of users
    :rtype: dict
    """

    users = await read_all(User)
    out_users = []
    for user in users:
        out_users.append(UserOut.parse_raw(user.json()))
    return list_modeltype_response(out_users, User)


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="User data added into the database")
async def add_user_data(user: UserCreate):
    """add_user_data add a new user

    :param user: defaults to Body(...)
    :type user: User, optional
    :return: data of new created user
    :rtype: dict
    """

    # check if valid email
    if not valid_email(user.email):
        raise InvalidEmailException()

    # check if email already used
    if await read_by_key_value(User, User.email, user.email):
        raise EmailAlreadyUsedException()

    new_user = await update(User.parse_obj(user))
    return response(new_user, "User added successfully.")


@router.post("/{id}/invite", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def invite_user(id: str):
    """invite_user this functions invites a user

    :param id: the user id
    :type id: str
    :return: response
    :rtype: success or error
    """
    user = await read_by_key_value(User, User.id, ObjectId(id))

    if user.active:
        raise UserAlreadyActiveException()

    # create an invite key
    invite_key, invite_expires = generate_new_invite_key(str(user.id))
    # save it
    db.redis.setex(invite_key, invite_expires, "true")
    # send email to user with the invite key
    send_invite(user.email, invite_key)
    return response(None, "Invite sent succesfull")


@router.post("/invites", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def invite_users(ids: List[str]):
    """invite_users this functions invites multiple users

    :param id: list of user ids
    :type id: List[str]
    :return: response
    :rtype: success or error
    """
    users = []
    for id in ids:
        users.append(await read_by_key_value(User, User.id, ObjectId(id)))

    # throw exception if any user is already active
    if any([user.active for user in users]):
        raise UserAlreadyActiveException()

    for user in users:
        # create an invite key
        invite_key, invite_expires = generate_new_invite_key(str(user.id))
        # save it
        db.redis.setex(invite_key, invite_expires, "true")
        # send email to user with the invite key
        send_invite(user.email, invite_key)

    return response(None, "Invites sent succesfull")


@router.get("/{id}", dependencies=[Depends(RoleChecker(UserRole.COACH))])
async def get_user(id: str):
    """get_user this functions returns the user with given id (or None)

    :param id: the user id
    :type id: str
    :return: response
    :rtype: success or error
    """
    user = await read_by_key_value(User, User.id, ObjectId(id))

    if not user:
        raise UserNotFoundException()

    if not user.approved:
        return errorresponse(None, 400, "The user doesn't exist (yet)")

    return response(UserOut.parse_obj(user), "User retrieved successfully")


@router.post("/{id}", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def update_user(id: str):
    """update_user this updates a user

    :param id: the user id
    :type id: str
    :return: response
    :rtype: success or error
    """
    user = await read_by_key_value(User, User.id, ObjectId(id))

    if not user.approved:
        return errorresponse(None, 400, "The user doesn't exist (yet)")

    return response(UserOut.parse_obj(user), "User retrieved successfully")


@router.post("/{user_id}/approve", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def approve_user(user_id: str):
    """approve_user this approves the user if the user account is activated

    :param user_id: the id of the user
    :type user_id: str
    :return: response
    :rtype: _type_
    """
    user = await read_by_key_value(User, User.id, ObjectId(user_id))

    if not user.active:
        return errorresponse(None, 400, "The user is not activated")
    if user.approved:
        return errorresponse(None, 400, "The user is already approved")

    user.approved = True
    await update(user)
    return response(None, "Approved the user successfully")
