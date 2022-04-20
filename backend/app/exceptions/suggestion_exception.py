from app.exceptions.base_exception import BaseException


class SuggestionNotFound(BaseException):
    def __init__(self):
        super().__init__(400, "Suggestion not found")
