from typing import List, Optional

from app.config import config
from bson import ObjectId
from odmantic import Model
from pydantic import BaseModel


class Student(Model):
    email: str
    name: str
    nickname: Optional[str] = None
    phone_number: str
    # alumn = False
    # cv: str
    question_answers: List[ObjectId]
    skills: List[ObjectId]  # role from skill.py
    edition: ObjectId


class StudentOutSimple(BaseModel):
    id: str
    email: str
    name: str
    nickname: Optional[str] = ""

    def __init__(self, **data):
        data["id"] = config.api_url + "students/" + data["id"]
        super().__init__(**data)
