from enum import Enum

from odmantic import Model
from pydantic import BaseModel


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


class UserCreate(BaseModel):
    email: str
    # password: str


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
