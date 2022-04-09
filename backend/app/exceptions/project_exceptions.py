from app.exceptions.base_exception import BaseException


class ProjectNotFoundException(BaseException):
    def __init__(self):
        super().__init__(400, "Project not found")
