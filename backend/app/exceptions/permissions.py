from app.exceptions.base_exception import BaseException
from fastapi import status


class NotPermittedException(BaseException):
    def __init__(self):
        super().__init__(status=status.HTTP_403_FORBIDDEN, message="Operation not permitted")
