from app.exceptions.base_exception import BaseException


class EmailTemplateNotFoundException(BaseException):
    def __init__(self):
        super().__init__(404, "Email template not found")
