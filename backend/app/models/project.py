from typing import List

from app.config import config
from bson import ObjectId
from odmantic import EmbeddedModel, Field, Model
from pydantic import BaseModel


class Partner(EmbeddedModel):
    name: str
    about: str


class RequiredRole(EmbeddedModel):
    role: ObjectId  # points to role from role.py
    number: int = Field(gt=0)


class Project(Model):
    name: str
    goals: List[str]
    description: str
    partner: Partner
    user_ids: List[ObjectId]
    required_roles: List[RequiredRole]
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
    required_roles: List[RequiredRole]
    edition: str

    def __init__(self, **data):
        data["id"] = config.api_url + "projects/" + data["id"]
        data["user_ids"] = [config.api_url + "users/" + user for user in data["user_ids"]]
        data["edition"] = config.api_url + "editions/" + data["edition"]
        super().__init__(**data)
