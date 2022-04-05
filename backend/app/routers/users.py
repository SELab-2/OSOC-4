from typing import List

from app.crud import read_all_where, read_where, update
from app.database import db, get_session
from app.exceptions.key_exceptions import InvalidResetKeyException
from app.exceptions.permissions import NotPermittedException
from app.exceptions.user_exceptions import (EmailAlreadyUsedException,
                                            PasswordsDoNotMatchException,
                                            UserAlreadyActiveException,
                                            UserBadStateException,
                                            UserNotFoundException)
from app.models.passwordreset import PasswordResetInput
from app.models.user import (User, UserCreate, UserData, UserOut,
                             UserOutSimple, UserRole)
from app.utils.checkers import RoleChecker
from app.utils.cryptography import get_password_hash
from app.utils.keygenerators import generate_new_invite_key
from app.utils.mailsender import send_invite
from app.utils.response import response
from fastapi import APIRouter, Body, Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/users")


@router.get("", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Users retrieved", response_model=List[UserOutSimple])
async def get_users(session: AsyncSession = Depends(get_session)):
    """get_users get all the users from the database

    :return: list of users url
    :rtype: dict
    """

    users = await read_all_where(User, session=session)
    return users


@router.get("/me", dependencies=[Depends(RoleChecker(UserRole.COACH))])
async def get_user_me(Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)):
    current_user_id = Authorize.get_jwt_subject()

    user = await read_where(User, User.id == int(current_user_id), session=session)
    # User will always be found since otherwise they can't be authorized
    # No need to check whether user exists

    return response(UserOutSimple.parse_raw(user.json()), "User retrieved successfully")


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.ADMIN))],
             response_description="User data added into the database")
async def add_user_data(user: UserCreate, session: AsyncSession = Depends(get_session)):
    """add_user_data add a new user

    :param user: defaults to Body(...)
    :type user: User, optional
    :return: data of new created user
    :rtype: dict
    """

    # check if email already used
    u = await read_where(User, User.email == user.email, session=session)
    if u:
        return response(UserOutSimple.parse_raw(u.json()), "User with email already exists")

    new_user = await update(User.parse_obj(user), session=session)
    return response(UserOutSimple.parse_raw(new_user.json()), "User added successfully.")


@router.post("/forgot/{reset_key}", dependencies=[Depends(RoleChecker(UserRole.COACH))])
async def change_password(reset_key: str, passwords: PasswordResetInput = Body(...), Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)):
    """change_password function that changes the user password

    :param reset_key: the reset key
    :type reset_key: str
    :param passwords: password and validate_password are needed, defaults to Body(...)
    :type passwords: PasswordResetInput, optional
    :raises InvalidResetKeyException: invalid reset key
    :raises PasswordsDoNotMatchException: passwords don't match
    :raises NotPermittedException: Unauthorized
    :return: message to check the emails
    :rtype: dict
    """

    if reset_key[0] != "R":
        raise InvalidResetKeyException()

    userid = db.redis.get(reset_key)

    if not userid:
        raise InvalidResetKeyException()
    elif passwords.password != passwords.validate_password:
        raise PasswordsDoNotMatchException()

    user = await read_where(User, User.id == userid, session=session)

    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()

    if not user or user.disabled or current_user_id != userid:
        raise NotPermittedException()

    user.password = get_password_hash(passwords.password)
    db.redis.delete(reset_key)
    await update(user, session=session)

    return response(None, "Password updated successfully")


@router.get("/{id}")
async def get_user(id: str, role: RoleChecker(UserRole.COACH) = Depends(), session: AsyncSession = Depends(get_session)):
    """get_user this functions returns the user with given id (or None)

    :param id: the user id
    :type id: str
    :return: response
    :rtype: success or error
    """
    user = await read_where(User, User.id == int(id), session=session)

    if not user:
        raise UserNotFoundException()

    return response(UserOut.parse_raw(user.json()), "User retrieved successfully")


@router.post("/{id}", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def update_user(id: str, new_data: UserData, session: AsyncSession = Depends(get_session)):
    """update_user this updates a user

    :param id: the user id
    :type id: str
    :param new_data: email and name, defaults to Body(...)
    :type new_data: UserData, optional
    :raises EmailAlreadyUsedException: email already in use
    :raises NotPermittedException: Unauthorized
    :return: response
    :rtype: success or error
    """

    user = await read_where(User, User.id == int(id), session=session)

    user_w_email = await read_where(User, User.email == new_data.email, session=session)

    if user is None:
        raise UserNotFoundException()
    if user_w_email is not None and user_w_email.id != user.id:
        # The email is already in use
        raise EmailAlreadyUsedException()
    else:
        # No other user with the new email address was found
        user.email = new_data.email

    user.name = new_data.name

    user = await update(user, session=session)

    return response(UserOut.parse_raw(user.json()), "User updated successfully")


@router.post("/{id}/invite", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def invite_user(id: str, session: AsyncSession = Depends(get_session)):
    """invite_user this functions invites a user

    :param id: the user id
    :type id: str
    :return: response
    :rtype: success or error
    """
    user = await read_where(User, User.id == int(id), session=session)

    if user is None:
        raise UserNotFoundException()
    elif user.active:
        raise UserAlreadyActiveException()

    # create an invite key
    invite_key, invite_expires = generate_new_invite_key()
    # save it
    db.redis.setex(invite_key, invite_expires, str(user.id))
    # send email to user with the invite key
    send_invite(user.email, invite_key)
    return response(None, "Invite sent successfully")


@router.post("/{user_id}/approve", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def approve_user(user_id: str, session: AsyncSession = Depends(get_session)):
    """approve_user this approves the user if the user account is activated

    :param user_id: the id of the user
    :type user_id: str
    :return: response
    :rtype: _type_
    """
    user = await read_where(User, User.id == int(user_id), session=session)

    if user is None:
        raise UserNotFoundException()
    elif not user.active:
        raise UserBadStateException()  # The user isn't activated
    elif user.approved:
        raise UserBadStateException()  # The user is already approved

    user.approved = True
    await update(user, session=session)
    return response(None, "Approved the user successfully")
