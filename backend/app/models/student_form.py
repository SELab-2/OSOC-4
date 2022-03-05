from pydantic import BaseModel, Field

from app.models.question_answers import QuestionAnswer
from typing import List
from odmantic import Model


class StudentForm(Model):
    email: str
    phonenumber: str
    questions: List[QuestionAnswer]
