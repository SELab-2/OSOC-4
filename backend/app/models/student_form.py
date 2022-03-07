from pydantic import BaseModel

from app.models.question_answers import QuestionAnswer
from typing import List
from odmantic import Model, ObjectId


class StudentForm(Model):
    birthname: str
    lastname: str
    email: str
    phonenumber: str
    nickname: str
    questions: List[QuestionAnswer]
    roles: List[ObjectId]
    # edition: Edition = Reference()

    # birthname: str
    # lastname: str
    # email: str
    # phonenumber: str
    # questions: List[QuestionAnswer]


class StudentFormOut(BaseModel):
    id: str
    birthname: str
    lastname: str
    email: str
    phonenumber: str
    nickname: str
