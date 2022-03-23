from app.models.question_answer import QuestionAnswer
from typing import List
from odmantic import Model
from bson import ObjectId


class Student(Model):
    email: str
    name: str
    nickname: str
    phone_number: str
    # alumn = False
    # cv: str
    question_answers: List[ObjectId]
    skills: List[ObjectId]  # role from skill.py
    edition: ObjectId
