from typing import Type

from odmantic.engine import ModelType


def response(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def errorresponse(error, code, message):
    return {"error": error, "code": code, "message": message}


def list_modeltype_response(results, model: Type[ModelType]):
    if results:
        return response(results, f"Successfully retrieved all instances of {model.__name__}")
    return response(results, f"No instances of {model.__name__} found, empty list returned")
