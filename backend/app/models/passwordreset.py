""" This module includes the input models for Email and Password
"""

from app.exceptions.validator_exeptions import (InvalidEmailException,
                                                InvalidPasswordException)
from app.utils.validators import valid_email, valid_password
from pydantic import BaseModel, validator


class EmailInput(BaseModel):
    """the expected input model (in the body of a HTML POST request) for requesting a password reset
    """
    email: str

    @validator('email')
    def email_format_check(cls, v: str) -> str:
        """validates the format of the email address supplied

        :param v: the value (the email address)
        :type v: str
        :raises InvalidEmailException: if the email address is not valid, this exception will be raised
        :return: the email address
        :rtype: str
        """
        if not valid_email(v):
            raise InvalidEmailException()
        return v


class PasswordResetInput(BaseModel):
    """the expected input model (in the body of a HTML POST request) for resetting a password
    """
    password: str
    validate_password: str

    @validator('password')
    def password_format_check(cls, v: str) -> str:
        """validates the format of the password supplied

        :param v: the value (the password)
        :type v: str
        :raises InvalidPasswordException: if the password is not valid, this exception will be raised
        :return: the password
        :rtype: str
        """
        if not valid_password(v):
            raise InvalidPasswordException()
        return v
