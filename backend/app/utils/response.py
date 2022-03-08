def response(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def errorresponse(error, code, message):
    return {"error": error, "code": code, "message": message}
