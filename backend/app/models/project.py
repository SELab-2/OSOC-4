from odmantic import Model, EmbeddedModel, Reference
from bson import ObjectId
from typing import List
from app.models.edition import Edition


class RequiredRole(EmbeddedModel):
    role: ObjectId
    number: int


class Project(Model):
    name: str
    goals: List[str]
    description: str
    student_amount: int
    partner_ids: List[ObjectId]
    coach_ids: List[ObjectId]
    required_roles: List[RequiredRole]
    edition: Edition = Reference()
