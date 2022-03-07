from odmantic import Model
from pydantic import BaseModel, Field
from enum import Enum


class UserRole(int, Enum):
    ADMIN = 0
    COACH = 1


class User(Model):
    email: str
    password: str
    role: UserRole = 1


class UserCreate(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    email: str
    role: UserRole


class UserLogin(BaseModel):
    email: str
    password: str
