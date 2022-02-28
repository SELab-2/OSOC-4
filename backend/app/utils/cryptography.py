from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """verify_password

    :param plain_password: password entered by user
    :type plain_password: str
    :param hashed_password: hashed password saved in database
    :type hashed_password: str
    :return: hashed_password and plain_password matched
    :rtype: bool
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """get_password_hash get the hash of a password

    :param password: the plain text password
    :type password: str
    :return: the hashed password from the plain text password
    :rtype: str
    """
    return pwd_context.hash(password)
