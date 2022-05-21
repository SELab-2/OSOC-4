""" This module includes all the invalid key exceptions
"""

from app.exceptions.base_exception import BaseException


class InvalidInviteException(BaseException):
    """InvalidInviteException exception for invalid invite

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "Invite is not valid or has expired")


class InvalidResetKeyException(BaseException):
    """InvalidInviteException exception for invalid reset key

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "The reset key is invalid or has expired")


class InvalidChangeKeyException(BaseException):
    """InvalidChangeKeyException exception for invalid change key

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "The change key is invalid or has expired")   
