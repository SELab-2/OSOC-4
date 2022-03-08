from app.database import db
from app.models.user import User
from app.utils.cryptography import get_password_hash


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
    new_user = await db.engine.save(user)
    return new_user


async def set_user_active(user: User, active: bool) -> User:
    """set_user_active this turns on or off the active field of the user

    :param user: the user object
    :type user: User
    :param active: boolean if user must be active or not
    :type active: bool
    :return: the user with the new active field
    :rtype: User
    """
    user.active = active
    new_user = await db.engine.save(user)
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
    new_user = await db.engine.save(user)
    return new_user
