from typing import List, Optional

from odmantic import ObjectId
from app.utils.cryptography import get_password_hash
from app.models.user import User
from app.database import engine


async def retrieve_users() -> List[User]:
    """retrieve_users

    :return: list of all users in the database
    :rtype: List[User]
    """
    res = await engine.find(User)
    return res


async def add_user(user: User) -> User:
    """add_user this adds a new user to the database

    :param user_data: user data to create a new user
    :type user_data: dict
    :return: returns the new user
    :rtype: User
    """
    # replace the plain password with the hashed one
    user.password = get_password_hash(user.password)

    new_user = await engine.save(user)
    return new_user


async def get_user_by_id(id: str) -> Optional[User]:
    """get_user_by_id this function returns the user with id

    :param id: the id of the user
    :type id: str
    :return: The user with the given id or None if the user doesn't exist
    :rtype: User
    """
    user = await engine.find_one(User, User.id == ObjectId(id))
    return user


async def get_user_by_email(email: str) -> Optional[User]:
    """get_user_by_email this function returns the user with email

    :param email: the email of the user
    :type email: str
    :return: The user with the given email or None if the user doesn't exist
    :rtype: User
    """
    user = await engine.find_one(User, User.email == email)
    return user


async def set_user_password(user: User, password: str) -> User:
    """set_user_password this function set the user password hashed

    :param user: the user object
    :type user: User
    :param password: the new password
    :type password: str
    :return: the user object with the new password
    :rtype: User
    """
    user.password = get_password_hash(password)
    new_user = await engine.save(user)
    return new_user


async def set_user_valid(user: User, valid: bool) -> User:
    """set_user_valid this turns on or off the valid field of the user

    :param user: the user object
    :type user: User
    :param valid: boolean if user must be valid or not
    :type valid: bool
    :return: the user with the new valid field
    :rtype: User
    """
    user.valid = valid
    new_user = await engine.save(user)
    return new_user


async def set_user_approved(user: User, approved: bool = True) -> User:
    """set_user_approved this approves a user

    :param user: the user object
    :type user: User
    :param approved: value to set to, defaults to True
    :type approved: bool, optional
    :return: the new user object
    :rtype: User
    """
    user.approved = approved
    new_user = await engine.save(user)
    return new_user
