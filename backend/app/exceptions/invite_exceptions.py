from app.exceptions.base_exception import BaseException


class InvalidInviteException(BaseException):
    def __init__(self):
        super().__init__(400, "Invite is not valid")
