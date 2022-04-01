from typing import Optional

from sqlmodel import Field, SQLModel


class Question(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    field_id: str
    question: str
