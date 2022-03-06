from odmantic import Model, Reference
from bson import ObjectId
from typing import List
from app.models.edition import Edition


class Project(Model):
    name: str
    goals: List[str]
    description: str
    student_amount: int
    partner_ids: List[ObjectId]
    coach_ids: List[ObjectId]
    required_roles: List[tuple[int, str]]
    edition: Edition = Reference()
