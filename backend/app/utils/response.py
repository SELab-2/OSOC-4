from time import strftime
from typing import Dict


def response(data, message: str) -> Dict:
    """response

    :param data: the data
    :type data
    :param message: the response message
    :type message: str
    :return: dictionary with data, status_code and message
    :rtype: Dict
    """
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def errorresponse(error, code: int, message: str):
    """errorresponse

    :param error: the error
    :type error 
    :param message: the response message
    :type message: str
    :return: dictionary with error, code and message
    :rtype: Dict
    """
    return {"error": error, "code": code, "message": message}
