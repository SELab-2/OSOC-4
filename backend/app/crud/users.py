from typing import List, Optional
from ..database import engine
from ..utils.cryptography import get_password_hash
from ..models.user import User


async def retrieve_users() -> List[User]:
    """retrieve_users

    :return: list of all users in the database
    :rtype: List[User]
    """
    users = []
    async for user in engine.find(User):
        user = User(**user)
        users.append(user)

    return users


async def add_user(user: User) -> User:
    """add_user this adds a new user to the database

    :param user_data: user data to create a new user
    :type user_data: dict
    :return: returns the new user
    :rtype: User
    """
    # replace the plain password with the hashed one
    user.password = get_password_hash(user.password)

    user = await engine.save(user)
    return user


async def get_user_by_username(username: str) -> Optional[User]:
    """get_user_by_username this function returns the user with username

    :param username: the username of the user
    :type username: str
    :return: The user with the given username or None if the user doesn't exist
    :rtype: User
    """
    user = await engine.find_one(User, User.username == username)
    if user:
        return user
    return None
