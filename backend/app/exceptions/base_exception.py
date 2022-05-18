import json

from fastapi.responses import JSONResponse


class BaseException(Exception):
    """BaseException is the base class for all exceptions

    :param Exception: inherits from python Exception class
    """
    def __init__(self, status_code: int, message: str):
        """__init__ init the class with the status code and message

        :param status_code: the status code of the response
        :type status_code: int
        :param message: the message of exception
        :type message: str
        """
        self.status_code = status_code
        self.message = message

    def json(self) -> JSONResponse:
        """json return the json of the exception

        :return: json reponse of exception
        :rtype: JSONResponse
        """
        return JSONResponse(status_code=self.status_code, content={"message": self.message})

    def checkResponse(self, response: BaseException) -> bool:
        """checkResponse compare the response exception with the exception

        :param response: the response exception
        :type response: _type_
        :return: if excepiton equals the response exception
        :rtype: bool
        """
        return response.status_code == self.status_code and json.loads(response.content)["message"] == self.message
