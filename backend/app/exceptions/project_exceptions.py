""" This module includes all the project exceptions
"""

from app.exceptions.base_exception import BaseException


class ProjectNotFoundException(BaseException):
    """ProjectNotFoundException exception for project not found

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "Project not found")
