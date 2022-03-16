from odmantic import Model, EmbeddedModel, Field
from bson import ObjectId
from typing import List


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
    student_amount: int = Field(ge=0)
    partner: Partner
    user_ids: List[ObjectId]
    required_roles: List[RequiredRole]
    edition: ObjectId
