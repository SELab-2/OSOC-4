""" This module includes all the models for the users
"""

from enum import Enum
from typing import List, Optional

from app.config import config
from app.exceptions.validator_exeptions import (EmptyNameException,
                                                InvalidEmailException,
                                                InvalidPasswordException)
from app.models.edition import Edition, EditionCoach
from app.models.project import Project, ProjectCoach
from app.models.suggestion import Suggestion
from app.utils.validators import valid_email, valid_password
from pydantic import BaseModel, validator
from sqlmodel import Field, Relationship, SQLModel


class UserRole(int, Enum):
    """represents the different roles a user can have
    """
    COACH = 1
    ADMIN = 2


class User(SQLModel, table=True):
    """represents a User from the database
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    name: str = ""
    password: str = ""
    role: UserRole = 1
    active: bool = False
    approved: bool = False
    disabled: bool = True
    editions: List[Edition] = Relationship(back_populates="coaches", link_model=EditionCoach)
    projects: List[Project] = Relationship(back_populates="coaches", link_model=ProjectCoach)
    suggestions: List[Suggestion] = Relationship(back_populates="suggested_by")

    class Config:
        """configuration for sqlmodels
        """
        validate_assignment = True

    @validator('email')
    def email_lowercase(cls, v: str) -> str:
        """converts the email address to lowercase

        :param v: the value, the email address
        :type v: str
        :return: the email address in lowercase
        :rtype: str
        """
        return v.lower()


class UserCreate(BaseModel):
    """the expected input model for creating a User
    """
    email: str

    @validator('email')
    def email_format_check(cls, v: str) -> str:
        """validates whether the email has a correct format

        :param v: the value (email address)
        :type v: str
        :raises InvalidEmailException: if the email address is invalid, this exception is raised
        :return: the email address
        :rtype: str
        """
        if not valid_email(v):
            raise InvalidEmailException()
        return v


class UserOutSimple(BaseModel):
    """an output model for a User
    """
    id: str

    def __init__(self, **data):
        """the constructor
            the kwargs in "data" are used to initialize the attributes of this class
        """
        data["id"] = config.api_url + "users/" + str(data["id"])
        super().__init__(**data)


class UserOut(BaseModel):
    """an output model for a User (gives more info than UserOutSimple)
    """
    email: str
    name: str
    role: UserRole
    id: str
    active: bool
    approved: bool
    disabled: bool


class UserLogin(BaseModel):
    """the expected input model for logging in
    """
    email: str
    password: str

    @validator('email')
    def email_lowercase_with_format(cls, v: str) -> str:
        """validates an email address and transforms it to lowercase

        :param v: the value (the email address)
        :type v: str
        :raises InvalidEmailException: if the email address is invalid, this exception will be raised
        :return: the email address transformed to lowercase
        :rtype: str
        """
        if not valid_email(v):
            raise InvalidEmailException()
        return v.lower()


class UserInvite(BaseModel):
    """the expected input model for a UserInvite
        this is the data you type in after clicking on the link in the email received when an admin invites you
    """
    name: str
    password: str
    validate_password: str

    @validator('name')
    def name_not_empty(cls, v: str) -> str:
        """validates that the name is not an empty string

        :param v: the value (the name)
        :type v: str
        :raises EmptyNameException: if the name is empty, this exception will be raised
        :return: the name
        :rtype: str
        """
        if v == "":
            raise EmptyNameException()
        return v

    @validator('password')
    def password_format_check(cls, v: str) -> str:
        """validates that the password is a valid password (see valid_password in app.utils.validators)

        :param v: the value (the password)
        :type v: str
        :raises InvalidPasswordException: if the password is not valid, this exception will be raised
        :return: the password
        :rtype: str
        """

        if not valid_password(v):
            raise InvalidPasswordException()
        return v


class UserResetPassword(BaseModel):
    """the expected input model for a user resetting his password
    """
    password: str
    validate_password: str

    @validator('password')
    def password_format_check(cls, v: str) -> str:
        """validates that the password is a valid password (see valid_password in app.utils.validators)

        :param v: the value (the password)
        :type v: str
        :raises InvalidPasswordException: if the password is not valid, this exception will be raised
        :return: the password
        :rtype: str
        """
        if not valid_password(v):
            raise InvalidPasswordException()
        return v


class UserResetEmail(BaseModel):
    """the expected input model for a user changing his email adres
    """
    email: str

    @validator('email')
    def email_lowercase_with_format(cls, v: str) -> str:
        """validates an email address and transforms it to lowercase

        :param v: the value (the email address)
        :type v: str
        :raises InvalidEmailException: if the email address is invalid, this exception will be raised
        :return: the email address transformed to lowercase
        :rtype: str
        """
        if not valid_email(v):
            raise InvalidEmailException()
        return v.lower()


class ChangeUser(BaseModel):
    """the expected input model for editing a User
    """
    name: str = ""
    role: int
    active: bool = False
    approved: bool = False
    disabled: bool = True

    @validator('name')
    def name_not_empty(cls, v: str) -> str:
        """validates that the name is not an empty string

        :param v: the value (the name)
        :type v: str
        :raises EmptyNameException: if the name is empty, this exception will be raised
        :return: the name
        :rtype: str
        """
        if v == "":
            raise EmptyNameException()
        return v


class ChangePassword(BaseModel):
    """the expected input model for a user to change his password
    """
    current_password: str
    new_password: str
    confirm_password: str

    @validator('new_password')
    def password_format_check(cls, v: str) -> str:
        """validates that the password is a valid password (see valid_password in app.utils.validators)

        :param v: the value (the password)
        :type v: str
        :raises InvalidPasswordException: if the password is not valid, this exception will be raised
        :return: the password
        :rtype: str
        """
        if not valid_password(v):
            raise InvalidPasswordException()
        return v


class UserMe(BaseModel):
    """an output model for yourself (when the user is you)
    """
    name: str
    email: str
    role: UserRole


class ChangeUserMe(BaseModel):
    """the expected input model, when the user is you, to edit you name
    """
    name: str = ""

    @validator('name')
    def name_not_empty(cls, v: str) -> str:
        """validates that the name is not an empty string

        :param v: the value (the name)
        :type v: str
        :raises EmptyNameException: if the name is empty, this exception will be raised
        :return: the name
        :rtype: str
        """
        if v == "":
            raise EmptyNameException()
        return v
