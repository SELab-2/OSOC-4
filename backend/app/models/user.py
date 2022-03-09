from odmantic import Model
from pydantic import BaseModel
from enum import Enum


class UserRole(int, Enum):
    ADMIN = 0
    COACH = 1


class User(Model):
    name: str = ""
    email: str
    password: str = ""
    role: UserRole = 1
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
