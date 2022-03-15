from enum import Enum

from app.exceptions.validator_exeptions import (InvalidEmailException,
                                                InvalidPasswordException)
from app.utils.validators import valid_email, valid_password
from odmantic import Model
from pydantic import BaseModel, validator


class UserRole(int, Enum):
    NO_ROLE = 0
    COACH = 1
    ADMIN = 2


class User(Model):
    name: str = ""
    email: str
    password: str = ""
    role: UserRole = 0
    active: bool = False
    approved: bool = False
    disabled: bool = True


class UserCreate(BaseModel):
    email: str
    # password: str

    @validator('email')
    def password_format_check(cls, v):
        if not valid_email(v):
            raise InvalidEmailException()
        return v


class UserOut(BaseModel):
    email: str
    name: str
    role: UserRole
    id: str
    active: bool
    approved: bool


class UserLogin(BaseModel):
    email: str
    password: str


class UserInvite(BaseModel):
    name: str
    password: str
    validate_password: str

    @validator('password')
    def password_format_check(cls, v):
        if not valid_password(v):
            raise InvalidPasswordException()
        return v
