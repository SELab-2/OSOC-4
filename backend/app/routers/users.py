from typing import List

from app.crud import read_all_where, read_where, update
from app.database import db, get_session
from app.exceptions.user_exceptions import (InvalidEmailOrPasswordException,
                                            PasswordsDoNotMatchException,
                                            UserAlreadyActiveException,
                                            UserBadStateException,
                                            UserNotFoundException)
from app.models.edition import Edition
from app.models.user import (ChangePassword, ChangeUser, ChangeUserMe, User,
                             UserCreate, UserMe, UserOut, UserOutSimple,
                             UserRole)
from app.utils.checkers import RoleChecker
from app.utils.cryptography import get_password_hash, verify_password
from app.utils.keygenerators import generate_new_invite_key
from app.utils.mailsender import send_invite
from app.utils.response import response
from fastapi import APIRouter, Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

router = APIRouter(prefix="/users")


@router.get("", dependencies=[Depends(RoleChecker(UserRole.ADMIN))], response_description="Users retrieved",
            response_model=List[UserOutSimple])
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

    return response(UserMe.parse_raw(user.json()), "User retrieved successfully")


@router.patch("/me", dependencies=[Depends(RoleChecker(UserRole.COACH))])
async def change_user_me(new_data: ChangeUserMe, Authorize: AuthJWT = Depends(),
                         session: AsyncSession = Depends(get_session)):
    current_user_id = Authorize.get_jwt_subject()

    user = await read_where(User, User.id == int(current_user_id), session=session)

    user.name = new_data.name

    user = await update(user, session=session)

    return response(UserOut.parse_raw(user.json()), "User updated successfully")


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


@router.get("/{id}")
async def get_user(id: str, role: RoleChecker(UserRole.COACH) = Depends(),
                   session: AsyncSession = Depends(get_session)):
    """get_user this functions returns the user with given id (or None)

    :param id: the user id
    :type id: str
    :return: response
    :rtype: success or error
    """
    user = await read_where(User, User.id == int(id), session=session)

    if not user:
        raise UserNotFoundException()

    if not role == UserRole.ADMIN and not user.approved:
        # This can't be reached since access would be blocked for users matching this if
        raise UserBadStateException()

    return response(UserOut.parse_raw(user.json()), "User retrieved successfully")


@router.patch("/{user_id}", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def update_user(user_id: str, new_data: ChangeUser, session: AsyncSession = Depends(get_session)):
    """update_user this updates a user

    :param user_id: the user id
    :type user_id: str
    :param new_data: name, active, approved, disabled and role
    :type new_data: ChangeUser
    :raises NotPermittedException: Unauthorized
    :return: response
    :rtype: success or error
    """

    user = await read_where(User, User.id == int(user_id), session=session)

    if user is None:
        raise UserNotFoundException()

    new_user_data = new_data.dict(exclude_unset=True)

    for key, value in new_user_data.items():
        setattr(user, key, value)
    user = await update(user, session=session)

    return response(UserOut.parse_raw(user.json()), "User updated successfully")


@router.delete("/{user_id}", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def delete_user(user_id: str, session: AsyncSession = Depends(get_session)):
    """delete_user this deletes a user (soft delete, disables the user & resets password related things)

    :param user_id: the user id
    :type user_id: str
    :raises NotPermittedException: Unauthorized
    :return: response
    :rtype: success or error
    """

    user = await read_where(User, User.id == int(user_id), session=session)

    if user is None:
        raise UserNotFoundException()

    user.disabled = True
    user.active = False
    user.approved = False
    user.password = ""

    user = await update(user, session=session)

    return response(UserOut.parse_raw(user.json()), "User deleted successfully")


@router.patch("/{user_id}/password", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def update_password(user_id: str, passwords: ChangePassword, session: AsyncSession = Depends(get_session)):
    """"update_password this changes the password of given user if previous password is given
        :param user_id: the user id
    :type user_id: str
    :param passwords: current_password, new_password and confirm_password
    :type passwords: ChangePassword
    :raises NotPermittedException: Unauthorized
    :return: response
    :rtype: success or error
    """

    if passwords.new_password != passwords.confirm_password:
        raise PasswordsDoNotMatchException()

    user = await read_where(User, User.id == int(user_id), session=session)

    if user is None:
        raise UserNotFoundException()

    if not verify_password(passwords.current_password, user.password):
        raise InvalidEmailOrPasswordException()

    user.password = get_password_hash(passwords.new_password)
    await update(user, session=session)
    return response(None, "Updated password successfully")


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

    # if the user was disabled, we need to re-enable him
    if user.disabled:
        user.disabled = False
        await update(user, session=session)

        # get the latest edition
        stat = select(Edition).options(selectinload(Edition.coaches)).order_by(Edition.year.desc())
        editionres = await session.execute(stat)
        (edition,) = editionres.first()
        edition.coaches.append(user)

        await update(edition, session=session)

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
