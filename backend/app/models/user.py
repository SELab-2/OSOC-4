from enum import Enum

from app.config import config
from app.exceptions.validator_exeptions import (EmptyNameException,
                                                InvalidEmailException,
                                                InvalidPasswordException,
                                                InvalidRoleException)
from app.utils.validators import valid_email, valid_password, valid_role
from odmantic import Model
from pydantic import BaseModel, validator


class UserRole(int, Enum):
    NO_ROLE = 0
    COACH = 1
    ADMIN = 2


class User(Model):
    email: str
    name: str = ""
    password: str = ""
    role: UserRole = 0
    active: bool = False
    approved: bool = False
    disabled: bool = True

    @validator('email')
    def email_lowercase(cls, v):
        return v.lower()


class UserCreate(BaseModel):
    email: str
    # password: str

    @validator('email')
    def password_format_check(cls, v):
        if not valid_email(v):
            raise InvalidEmailException()
        return v


class UserOutSimple(BaseModel):
    id: str

    def __init__(self, **data):
        data["id"] = config.api_url + "users/" + data["id"]
        super().__init__(**data)


class UserOut(BaseModel):
    email: str
    name: str
    role: UserRole
    id: str
    active: bool
    approved: bool


class UserData(BaseModel):
    email: str
    name: str


class UserLogin(BaseModel):
    email: str
    password: str

    @validator('email')
    def email_lowercase_with_format(cls, v):
        if not valid_email(v):
            raise InvalidEmailException()
        return v.lower()


class UserInvite(BaseModel):
    name: str
    password: str
    validate_password: str

    @validator('name')
    def name_not_empty(cls, v):
        if v == "":
            raise EmptyNameException()
        return v

    @validator('password')
    def password_format_check(cls, v):
        if not valid_password(v):
            raise InvalidPasswordException()
        return v


class UserChangeRole(BaseModel):
    role: int

    @validator('role')
    def role_in_range(cls, v):
        if not valid_role(v):
            raise InvalidRoleException()
        return v


class UserChangeStatus(BaseModel):
    active: bool
