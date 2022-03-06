from odmantic import Model, Field
from typing import List
from bson import ObjectId


class Edition(Model):
    form_id: str = Field(primary_field=True)
    name: str
    year: int
    description: str
    coach_ids: List[ObjectId]
