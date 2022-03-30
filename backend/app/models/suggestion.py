from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class SuggestionOption(int, Enum):
    NO = 0
    MAYBE = 1
    YES = 2


class Suggestion(SQLModel):
    # mail_sent: bool
    id: Optional[int] = Field(default=None, primary_key=True)
    decision: SuggestionOption
    definitive: bool
    reason: str
    student: int = Field(default=None, foreign_key="student.id")
    suggested_by: int = Field(default=None, foreign_key="user.id")
    # project: Optional[ObjectId]
    # skill: Optional[ObjectId]
