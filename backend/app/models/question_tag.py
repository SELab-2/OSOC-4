from sqlmodel import Field, SQLModel
from typing import Optional


class question_tag(SQLModel, table=True):
    question_id: Optional[int] = Field(default=None, foreign_key="question.id")
    tag: str = Field(primary_key=True)
    edition: int = Field(primary_key=True, foreign_key="edition.year")
