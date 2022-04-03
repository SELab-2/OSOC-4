from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class QuestionTag(SQLModel, table=True):
    question_id: Optional[int] = Field(default=None, foreign_key="question.id")
    tag: str = Field(primary_key=True)
    edition: int = Field(primary_key=True, foreign_key="edition.year")

    question: "Question" = Relationship(back_populates="question_tags")
