from app.exceptions.base_exception import BaseException


class InvalidEmailException(BaseException):
    def __init__(self):
        super().__init__(400, "The entered email doesn't have the right format")


class InvalidPasswordException(BaseException):
    def __init__(self):
        super().__init__(400, "The entered password doesn't meet the requirements")
