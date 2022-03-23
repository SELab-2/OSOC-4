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
    goals: List[str]
    description: str
    partner: Partner
    user_ids: List[str]
    required_roles: List[RequiredSkills]
    edition: str

    def __init__(self, **data):
        data["id"] = config.api_url + "projects/" + data["id"]
        data["user_ids"] = [config.api_url + "users/" + user for user in data["user_ids"]]
        data["edition"] = config.api_url + "editions/" + data["edition"]
        super().__init__(**data)
