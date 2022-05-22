""" This module includes all the QuestionTag exceptions
"""

from typing import List

from app.exceptions.base_exception import BaseException


class QuestionTagAlreadyExists(BaseException):
    """QuestionTagAlreadyExists exception when a QuestionTag with name already exists

    :param BaseException: inherits from BaseException
    """
    def __init__(self, tag):
        """__init__ inits parent class with status code and message
        """
        super().__init__(409, f"Tag {str(tag)} already exists")


class QuestionTagNotFoundException(BaseException):
    """QuestionTagNotFoundException exception when a QuestionTag not found

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "Questiontag not found")


class QuestionTagCantBeModified(BaseException):
    """QuestionTagNotFoundException exception when a QuestionTag can't be modified

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(409, "Question of QuestionTag can't be modified")


class QuestionTagInvalidMandatory(BaseException):
    """QuestionTagNotFoundException exception when a mandatory QuestionTag's question is invalid (not found)

    :param BaseException: inherits from BaseException
    """
    def __init__(self, questiontags: List[str]):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "Something went wrong, fix the questions for the mandatory questiontags: " + ", ".join(questiontags))
