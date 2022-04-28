from app.exceptions.base_exception import BaseException


class EmailTemplateNotFoundException(BaseException):
    def __init__(self):
        super().__init__(400, "Email template not found")
