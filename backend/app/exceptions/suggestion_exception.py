""" This module includes all the suggestion exceptions
"""

from app.exceptions.base_exception import BaseException


class SuggestionNotFound(BaseException):
    """SuggestionNotFound exception when a suggestion isn't found

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "Suggestion not found")
