""" This module includes the Answer model
"""

from typing import List, Optional

from app.models.question_answer import QuestionAnswer
from sqlalchemy import Index
from sqlmodel import Field, Relationship, SQLModel


class Answer(SQLModel, table=True):
    """represents an answer from the database
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    answer: str

    question_answers: List[QuestionAnswer] = Relationship(back_populates="answer")

    __table_args__ = (
        Index('answer_idx', "answer",
              postgresql_ops={"answer": "gin_trgm_ops"},
              postgresql_using='gin'),
    )
