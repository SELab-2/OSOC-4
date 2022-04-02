from typing import Optional, List
from sqlalchemy import Index
from sqlmodel import Field, SQLModel, Relationship
from app.models.question_answer import QuestionAnswer


class Answer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    answer: str

    question_answers: List[QuestionAnswer] = Relationship(back_populates="answer")

    __table_args__ = (
        Index('answer_idx', "answer",
              postgresql_ops={"answer": "gin_trgm_ops"},
              postgresql_using='gin'),
    )
