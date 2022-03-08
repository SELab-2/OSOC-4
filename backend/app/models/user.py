from odmantic import Model
from pydantic import BaseModel
from enum import Enum


class UserRole(int, Enum):
    ADMIN = 0
    COACH = 1


class User(Model):
    email: str
    password: str
    role: UserRole = 1
    active: bool = False
    approved: bool = False


class UserCreate(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    role: UserRole


class UserLogin(BaseModel):
    email: str
    password: str


class UserInvite(BaseModel):
    password: str
    validate_password: str
