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
    edition: int


class StudentOutSimple(BaseModel):
    id: str

    def __init__(self, **data):
        data["id"] = config.api_url + "students/" + data["id"]
        super().__init__(**data)


class StudentOutExtended(BaseModel):
    id: str
    email: str
    name: str
    nickname: Optional[str] = ""
    phone_number: str
    question_answers: List[str]
    skills: List[str]
    edition: str

    def __init__(self, **data):
        data["id"] = config.api_url + "students/" + data["id"]
        data["question_answers"] = [config.api_url + "question_answers/" + qa for qa in data["question_answers"]]
        data["skills"] = [config.api_url + "roles/" + skill for skill in data["skills"]]
        data["edition"] = config.api_url + "editions/" + str(data["edition"])
        super().__init__(**data)
