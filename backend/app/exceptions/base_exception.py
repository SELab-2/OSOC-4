import json

from fastapi.responses import JSONResponse


class BaseException(Exception):
    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message

    def json(self):
        return JSONResponse(status_code=self.status_code, content={"message": self.message})

    def checkResponse(self, response):
        return response.status_code == self.status_code and json.loads(response.content)["message"] == self.message
