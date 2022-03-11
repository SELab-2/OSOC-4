from odmantic import Model
from typing import List, Optional
from bson import ObjectId


class Edition(Model):
    form_id: Optional[str] = None
    name: Optional[str] = None
    year: int
    description: Optional[str] = None
    user_ids: List[ObjectId] = []
