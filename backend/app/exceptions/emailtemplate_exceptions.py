from app.exceptions.base_exception import BaseException


class EmailTemplateNotFoundException(BaseException):
    """EmailTemplateNotFoundException exception when the email template is not found

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(404, "Email template not found")
