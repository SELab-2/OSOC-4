from fastapi import HTTPException


class BaseException(Exception):
    def __init__(self, status, message):
        self.status = status
        self.message = message

    def _raise(self):
        raise HTTPException(
            status_code=self.status, detail=self.message)
