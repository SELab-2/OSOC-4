from typing import List, Optional
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


async def get_user_by_email(email: str) -> Optional[User]:
    """get_user_by_email this function returns the user with email

    :param email: the email of the user
    :type email: str
    :return: The user with the given email or None if the user doesn't exist
    :rtype: User
    """
    user = await engine.find_one(User, User.email == email)
    return user
