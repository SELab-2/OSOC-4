from app.exceptions.base_exception import BaseException


class EditionNotFound(BaseException):
    def __init__(self):
        super().__init__(400, "Edition not found")


class AlreadyEditionWithYearException(BaseException):
    def __init__(self, year):
        super().__init__(409, f"Edition with year {str(year)} already exist")


class YearAlreadyOverException(BaseException):
    def __init__(self):
        super().__init__(409, "Unable to create edition for year that is over")


class EditionYearModifyException(BaseException):
    def __init__(self):
        super().__init__(400, "Edition year can't be modified")


class StudentNotFoundException(BaseException):
    def __init__(self):
        super().__init__(400, "Student not found")
