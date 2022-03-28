from enum import Enum
from typing import Optional

from app.config import config
from app.exceptions.validator_exeptions import (EmptyNameException,
                                                InvalidEmailException,
                                                InvalidPasswordException)
from app.utils.validators import valid_email, valid_password
from odmantic import Model
from pydantic import BaseModel, validator
from pydantic.dataclasses import dataclass
from sqlmodel import Field, SQLModel


class UserRole(int, Enum):
    NO_ROLE = 0
    COACH = 1
    ADMIN = 2


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
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

@dataclass
class UserOutSimple(BaseModel):
    id: str

    def __post_init__(self):
        self.id = config.api_url + "users/" + self.id


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
