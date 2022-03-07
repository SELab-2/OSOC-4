from pydantic import BaseModel, Field

from app.models.question_answers import QuestionAnswer
from typing import List
from odmantic import Model, ObjectId
from odmantic.bson import BSON_TYPES_ENCODERS


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
    name: str
    email: str
    phonenumber: str
    nickname: str
