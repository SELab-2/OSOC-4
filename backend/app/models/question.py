from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from app.models.question_answer import QuestionAnswer


class Question(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    field_id: str
    question: str

    question_answers: List[QuestionAnswer] = Relationship(back_populates="question")
