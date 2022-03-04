from pydantic import BaseModel, Field


class User(BaseModel):
    username: str = Field(index=True)
    password: str = Field(...)


class UserLogin(BaseModel):
    username: str
    password: str
