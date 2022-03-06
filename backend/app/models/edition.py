from odmantic import Model, Field
from typing import List
from pydantic import root_validator
from bson import ObjectId
from app.database import engine
from app.models.user import User


class Edition(Model):
    form_id: str = Field(primary_field=True)
    name: str
    year: int
    description: str
    coach_ids: List[ObjectId]
