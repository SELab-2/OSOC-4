from app.exceptions.base_exception import BaseException


class PasswordsDoNotMatchException(BaseException):
    def __init__(self):
        super().__init__(400, "Passwords do not match")


class EmailAlreadyUsedException(BaseException):
    def __init__(self):
        super().__init__(400, "Email already used")


class UserNotFoundException(BaseException):
    def __init__(self):
        super().__init__(404, "User not found")


class UserAlreadyActiveException(BaseException):
    def __init__(self):
        super().__init__(400, "User is already active")


class InvalidEmailOrPasswordException(BaseException):
    def __init__(self):
        super().__init__(401, "Invalid email or password")
