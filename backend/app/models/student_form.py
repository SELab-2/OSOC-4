from pydantic import BaseModel, Field

from app.models.question_answer import QuestionAnswer
from typing import List
from odmantic import Model


class StudentForm(Model):
    name: str
    email: str
    phonenumber: str
    nickname: str
    questions: List[QuestionAnswer]
