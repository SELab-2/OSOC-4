from typing import List

from app.config import config
from bson import ObjectId
from odmantic import EmbeddedModel, Field, Model
from pydantic import BaseModel


class Partner(EmbeddedModel):
    name: str
    about: str


class RequiredSkills(EmbeddedModel):
    skill: ObjectId  # points to role from skill.py
    number: int = Field(gt=0)


class Project(Model):
    name: str
    description: str
    goals: List[str]
    partner: Partner
    required_skills: List[RequiredSkills]
    users: List[ObjectId]
    edition: ObjectId


class ProjectOutSimple(BaseModel):
    id: str

    def __init__(self, **data):
        data["id"] = config.api_url + "projects/" + data["id"]
        super().__init__(**data)


class ProjectOutExtended(BaseModel):
    id: str
    name: str
    description: str
    goals: List[str]
    partner: Partner
    required_skills: List[RequiredSkills]
    users: List[str]
    edition: str

    def __init__(self, **data):
        data["id"] = config.api_url + "projects/" + data["id"]
        data["users"] = [config.api_url + "users/" + user for user in data["users"]]
        data["edition"] = config.api_url + "editions/" + data["edition"]
        super().__init__(**data)
