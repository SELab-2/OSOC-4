from app.exceptions.base_exception import BaseException


class ParticipationNotFoundException(BaseException):
    def __init__(self):
        super().__init__(400, "Participation not found")


class InvalidParticipationException(BaseException):
    def __init__(self):
        super().__init__(409, "Invalid participation")
