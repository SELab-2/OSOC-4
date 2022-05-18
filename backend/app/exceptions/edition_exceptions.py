""" This module includes all the edition exceptions
"""

from app.exceptions.base_exception import BaseException


class EditionNotFound(BaseException):
    """EditionNotFound exception for edition not found

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(404, "Edition not found")


class AlreadyEditionWithYearException(BaseException):
    """AlreadyEditionWithYearException Exception if edition with year already exists

    :param BaseException: inherits from BaseException
    """
    def __init__(self, year: int):
        """__init__ inits parent class with status code and message
        """
        super().__init__(409, f"Edition with year {str(year)} already exist")


class YearAlreadyOverException(BaseException):
    """YearAlreadyOverException Exception the year wanted for a new edition is already over

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(409, "Unable to create edition for year that is over")


class EditionYearModifyException(BaseException):
    """EditionYearModifyException exception that the year can't be modified

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "Edition year can't be modified")


class StudentNotFoundException(BaseException):
    """StudentNotFoundException exception when student not found in edition

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(404, "Student not found")
