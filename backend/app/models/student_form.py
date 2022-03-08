from app.models.question_answer import QuestionAnswer
from app.models.edition import Edition
from typing import List
from odmantic import Model, Reference
from bson import ObjectId


class StudentForm(Model):
    name: str
    email: str
    phonenumber: str
    nickname: str
    questions: List[QuestionAnswer]
    roles: List[ObjectId]  # role from role.py
    edition: Edition = Reference()
