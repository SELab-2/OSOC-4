from typing import List

from bson import ObjectId
from odmantic import Model


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
