from typing import List, Optional

from app.config import config
from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class Partner(BaseModel):
    name: str
    about: str


# class RequiredSkills(EmbeddedModel):
#     skill: ObjectId  # points to role from skill.py
#     number: int = Field(gt=0)


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    goals: str
    # partner: Partner
    # required_skills: List[RequiredSkills]
    # users: List[int]
    edition: int = Field(
        default=None, foreign_key="edition.year"
    )


class ProjectCreate(BaseModel):
    name: str
    description: str
    goals: List[str]
    partner: Partner
    # required_skills: List[RequiredSkills]
    users: List[int] = []
    edition: int


class ProjectOutSimple(BaseModel):
    id: str
    name: str

    def __init__(self, **data):
        data["id"] = config.api_url + "projects/" + data["id"]
        super().__init__(**data)


class ProjectOutExtended(BaseModel):
    id: str
    name: str
    description: str
    goals: List[str]
    partner: Partner
    # required_skills: List[RequiredSkills]
    users: List[str]
    edition: str

    def __init__(self, **data):
        super().__init__(**data)
        data["id"] = config.api_url + "projects/" + data["id"]
        data["users"] = [config.api_url + "users/" + user for user in data["users"]]
        data["edition"] = config.api_url + "editions/" + str(data["edition"])
