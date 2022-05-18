""" This module includes all the validation exceptions
"""

from app.exceptions.base_exception import BaseException


class InvalidEmailException(BaseException):
    """InvalidEmailException Exception when the email doesn't have the right format

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "The entered email doesn't have the right format")


class InvalidPasswordException(BaseException):
    """InvalidPasswordException Exception when password does not meet the requirements

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "The entered password doesn't meet the requirements")


class EmptyNameException(BaseException):
    """EmptyNameException Exception when given name is empty

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "The entered name cannot be empty")
