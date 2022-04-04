from typing import List, Optional

from app.models.question_answer import QuestionAnswer
from app.models.question_tag import QuestionTag
from sqlmodel import Field, Relationship, SQLModel


class Question(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    field_id: str
    question: str

    question_answers: List[QuestionAnswer] = Relationship(back_populates="question")
    question_tags: List[QuestionTag] = Relationship(back_populates="question")
