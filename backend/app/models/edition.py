from typing import List, Optional

from app.config import config
from pydantic import BaseModel
from sqlmodel import Field, SQLModel, Relationship


class EditionCoach(SQLModel, table=True):
    edition: Optional[int] = Field(default=None, primary_key=True, foreign_key="edition.year")
    coach_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="user.id")


class Edition(SQLModel, table=True):
    year: int = Field(primary_key=True)
    name: str
    description: Optional[str] = None
    form_id: Optional[str] = None
    coaches: List["User"] = Relationship(back_populates="editions", link_model=EditionCoach)
    students: List["Student"] = Relationship(back_populates="edition")


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
