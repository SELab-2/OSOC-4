""" This module includes the NotPermittedException
"""

from app.exceptions.base_exception import BaseException
from fastapi import status


class NotPermittedException(BaseException):
    """NotPermittedException exception when action by user is not permitted

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, message="Operation not permitted")
