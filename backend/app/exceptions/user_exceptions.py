""" This module includes all the user exceptions
"""

from app.exceptions.base_exception import BaseException


class PasswordsDoNotMatchException(BaseException):
    """PasswordsDoNotMatchException Exception when the two passwords do not match when creating a user

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "Passwords do not match")


class EmailsDoNotMatchException(BaseException):
    """EmailsDoNotMatchException Exception when the two emails do not match when creating a user

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "Emails do not match")


class EmailAlreadyUsedException(BaseException):
    """EmailAlreadyUsedException Exception when trying to create user that with email that is already in use

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "Email already used")


class UserNotApprovedException(BaseException):
    """UserNotApprovedException Exception when user tries action when the user is not approved

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "The user doesn't exist (yet)")


class UserBadStateException(BaseException):
    """UserNotFoundException Exception when user is not found

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "The user doesn't have the expected state")


class UserNotFoundException(BaseException):
    """UserNotFoundException Exception when user is not found

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(404, "User not found")


class UserAlreadyActiveException(BaseException):
    """UserAlreadyActiveException Exception when user tries to activate but already is

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "User is already active")


class InvalidEmailOrPasswordException(BaseException):
    """InvalidEmailOrPasswordException Exception when the email or password is invalid

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(401, "Invalid email or password")
