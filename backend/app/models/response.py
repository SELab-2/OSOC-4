def Response(data, message):
    return {
        "data": [data],
        "code": 200,
        "message": message,
    }


def ErrorResponse(error, code, message):
    return {"error": error, "code": code, "message": message}