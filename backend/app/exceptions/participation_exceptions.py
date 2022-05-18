from app.exceptions.base_exception import BaseException


class ParticipationNotFoundException(BaseException):
    """ParticipationNotFoundException exception for participation not found

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "Participation not found")


class InvalidParticipationException(BaseException):
    """InvalidParticipationException exception for invalid participation

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(409, "Invalid participation")
