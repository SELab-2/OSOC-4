from odmantic import Model, EmbeddedModel, Reference, Field
from bson import ObjectId
from typing import List
from app.models.edition import Edition


class RequiredRole(EmbeddedModel):
    role: ObjectId
    number: int = Field(gt=0)


class Project(Model):
    name: str
    goals: List[str]
    description: str
    student_amount: int = Field(ge=0)
    partner_ids: List[ObjectId]
    coach_ids: List[ObjectId]
    required_roles: List[RequiredRole]
    edition: Edition = Reference()
