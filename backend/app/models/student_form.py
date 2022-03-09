from app.models.question_answer import QuestionAnswer
from typing import List
from odmantic import Model
from bson import ObjectId


class StudentForm(Model):
    name: str
    email: str
    phonenumber: str
    nickname: str
    questions: List[QuestionAnswer]
    roles: List[ObjectId]  # role from role.py
    edition: ObjectId
