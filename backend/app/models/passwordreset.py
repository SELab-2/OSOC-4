from app.exceptions.validator_exeptions import (InvalidEmailException,
                                                InvalidPasswordException)
from app.utils.validators import valid_email, valid_password
from pydantic import BaseModel, validator


class EmailInput(BaseModel):
    email: str

    @validator('email')
    def email_format_check(cls, v):
        if not valid_email(v):
            raise InvalidEmailException()
        return v


class PasswordResetInput(BaseModel):
    password: str
    validate_password: str

    @validator('password')
    def password_format_check(cls, v):
        if not valid_password(v):
            raise InvalidPasswordException()
        return v
