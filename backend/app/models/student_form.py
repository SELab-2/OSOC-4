from pydantic import BaseModel, Field

from app.models.question_answers import QuestionAnswer
from typing import List
from odmantic import Model


class StudentForm(Model):
    birthname: str
    lastname: str
    email: str
    phonenumber: str
    questions: List[QuestionAnswer]
