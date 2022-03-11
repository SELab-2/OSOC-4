from app.exceptions.base_exception import BaseException


class NameAlreadyUsedException(BaseException):
    def __init__(self):
        super().__init__(409, "The name is already in use")


class PartnerNotFoundException(BaseException):
    def __init__(self):
        super().__init__(404, "Partner not found")
