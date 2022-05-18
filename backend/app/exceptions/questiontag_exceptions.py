from app.exceptions.base_exception import BaseException


class QuestionTagAlreadyExists(BaseException):
    """QuestionTagAlreadyExists exception when a questiontag with name already exists

    :param BaseException: inherits from BaseException
    """
    def __init__(self, tag):
        """__init__ inits parent class with status code and message
        """
        super().__init__(409, f"Tag {str(tag)} already exists")


class QuestionTagNotFoundException(BaseException):
    """QuestionTagNotFoundException exception when a questiontag not found

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(400, "Questiontag not found")


class QuestionTagCantBeModified(BaseException):
    """QuestionTagNotFoundException exception when a questiontag can't be modified

    :param BaseException: inherits from BaseException
    """
    def __init__(self):
        """__init__ inits parent class with status code and message
        """
        super().__init__(409, "Question of questiontag can't be modified")
