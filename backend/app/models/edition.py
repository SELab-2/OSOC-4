from typing import List, Optional

from app.config import config
from bson import ObjectId
from odmantic import Model, Field
from pydantic import BaseModel


class Edition(Model):
    year: int = Field(primary_field=True)
    name: Optional[str] = None
    description: Optional[str] = None
    form_id: Optional[str] = None
    user_ids: List[ObjectId] = []


class EditionOutSimple(BaseModel):
    uri: str
    name: Optional[str] = ""

    def __init__(self, **data):
        data["uri"] = config.api_url + "editions/" + str(data["year"])
        super().__init__(**data)


class EditionOutExtended(BaseModel):
    uri: str
    name: Optional[str] = ""
    description: Optional[str] = ""
    user_ids: List[str]

    def __init__(self, **data):
        data["uri"] = config.api_url + "editions/" + str(data["year"])

        data["user_ids"] = [config.api_url + "users/" + user for user in data["user_ids"]]
        super().__init__(**data)
