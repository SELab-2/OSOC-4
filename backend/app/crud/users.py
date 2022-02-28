from typing import List, Optional
from ..database import user_collection
from ..utils.cryptography import get_password_hash
from ..models.user import User

async def retrieve_users() -> List[User]:
    """retrieve_users

    :return: list of all users in the database
    :rtype: List[User]
    """
    users = []
    async for user in user_collection.find():
        user = User(**user)
        users.append(user)

    return users

async def add_user(user_data: dict) -> User:
    """add_user this adds a new user to the database

    :param user_data: user data to create a new user
    :type user_data: dict
    :return: returns the new user
    :rtype: User
    """
    # replace the plain password with the hashed one
    user_data['password'] = get_password_hash(user_data['password'])

    user = await user_collection.insert_one(user_data)
    new_user = await user_collection.find_one({"_id": user.inserted_id})
    new_user = User(**new_user)
    return new_user


async def get_user_by_username(username:str) -> Optional[User]:
    """get_user_by_username this function returns the user with username

    :param username: the username of the user
    :type username: str
    :return: The user with the given username or None if the user doesn't exist
    :rtype: User
    """
    user = await user_collection.find_one({"username": username})
    if user:
        return User(**user)
    return None