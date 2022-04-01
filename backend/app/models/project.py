from typing import List, Optional

from app.config import config
from pydantic import BaseModel
from sqlmodel import Field, SQLModel

# class RequiredSkills(EmbeddedModel):
#     skill: ObjectId  # points to role from skill.py
#     number: int = Field(gt=0)


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    goals: str
    # required_skills: List[RequiredSkills]
    # users: List[int]
    partner_name: str
    partner_description: str
    edition: int = Field(
        default=None, foreign_key="edition.year"
    )


class ProjectCreate(BaseModel):
    name: str
    description: str
    goals: List[str]
    # required_skills: List[RequiredSkills]
    partner_name: str
    partner_description: str
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
    partner_name: str
    partner_description: str
    # required_skills: List[RequiredSkills]
    users: List[str]
    edition: str

    def __init__(self, **data):
        super().__init__(**data)
        data["id"] = config.api_url + "projects/" + data["id"]
        data["users"] = [config.api_url + "users/" + user for user in data["users"]]
        data["edition"] = config.api_url + "editions/" + str(data["edition"])
