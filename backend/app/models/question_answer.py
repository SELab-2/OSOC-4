from typing import Optional

from sqlmodel import Field, SQLModel


class QuestionAnswer(SQLModel, table=True):
    student: int = Field(
        default=None, foreign_key="student.id", primary_key=True
    )
    question: int = Field(
        default=None, foreign_key="question.id", primary_key=True
    )
    answer: int = Field(
        default=None, foreign_key="answer.id", primary_key=True
    )
