from app.exceptions.base_exception import BaseException


class AlreadyEditionWithYearException(BaseException):
    def __init__(self, year):
        super().__init__(409, f"Edition with year {str(year)} already exist")


class YearAlreadyOverException(BaseException):
    def __init__(self):
        super().__init__(409, "Unable to create edition for year that is over")
