from enum import Enum
from typing import Optional, List

from app.config import config
from app.exceptions.validator_exeptions import (EmptyNameException,
                                                InvalidEmailException,
                                                InvalidPasswordException)
from app.utils.validators import valid_email, valid_password
from pydantic import BaseModel, validator
from sqlmodel import Field, SQLModel, Relationship
from app.models.edition import EditionCoach, Edition
from app.models.project import ProjectCoach, Project
from app.models.suggestion import Suggestion


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
    editions: List[Edition] = Relationship(back_populates="coaches", link_model=EditionCoach)
    projects: List[Project] = Relationship(back_populates="coaches", link_model=ProjectCoach)
    suggestions: List[Suggestion] = Relationship(back_populates="suggested_by")

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
        data["id"] = config.api_url + "users/" + str(data["id"])
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


class UserResetPassword(BaseModel):
    password: str
    validate_password: str

    @validator('password')
    def password_format_check(cls, v):
        if not valid_password(v):
            raise InvalidPasswordException()
        return v
