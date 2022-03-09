from odmantic import Model
from typing import List
from bson import ObjectId


class Edition(Model):
    form_id: str
    name: str
    year: int
    description: str
    user_ids: List[ObjectId]
