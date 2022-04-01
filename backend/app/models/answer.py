from typing import Optional

from sqlalchemy import Index
from sqlmodel import Field, SQLModel


class Answer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    answer: str
    __table_args__ = (
        Index('answer_idx', "answer",
              postgresql_ops={"answer": "gin_trgm_ops"},
              postgresql_using='gin'),
    )
