from app.exceptions.base_exception import BaseException


class QuestionTagAlreadyExists(BaseException):
    def __init__(self, tag):
        super().__init__(409, f"Tag {str(tag)} already exists")

class QuestionTagNotFoundException(BaseException):
    def __init__(self):
        super().__init__(400, "Questiontag not found")

class QuestionTagCantBeModified(BaseException):
    def __init__(self):
        super().__init__(409, "Question of questiontag can't be modified")
