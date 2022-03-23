from typing import List, Optional

from app.config import config
from bson import ObjectId
from odmantic import Model
from pydantic import BaseModel


class Edition(Model):
    year: int
    name: Optional[str] = None
    description: Optional[str] = None
    form_id: Optional[str] = None
    user_ids: List[ObjectId] = []


class EditionOutSimple(BaseModel):
    id: str

    def __init__(self, **data):
        data["id"] = config.api_url + "editions/" + data["id"]
        super().__init__(**data)


class EditionOutExtended(BaseModel):
    id: str
    name: Optional[str] = ""
    year: int
    description: Optional[str] = ""
    user_ids: List[str]

    def __init__(self, **data):
        data["id"] = config.api_url + "editions/" + data["id"]

        data["user_ids"] = [config.api_url + "users/" + user for user in data["user_ids"]]
        super().__init__(**data)
