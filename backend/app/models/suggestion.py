from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel, Relationship


class SuggestionOption(int, Enum):
    NO = 0
    MAYBE = 1
    YES = 2


class Suggestion(SQLModel, table=True):
    # mail_sent: bool
    id: Optional[int] = Field(default=None, primary_key=True)
    decision: SuggestionOption
    definitive: bool
    reason: str

    student_id: int = Field(foreign_key="student.id")
    suggested_by_id: int = Field(foreign_key="user.id")
    project_id: Optional[int] = Field(default=None, foreign_key="project.id")
    skill_name: Optional[str] = Field(default=None, foreign_key="skill.name")

    student: "Student" = Relationship(back_populates="suggestions")
    suggested_by: "User" = Relationship(back_populates="suggestions")
    project: Optional["Project"] = Relationship(back_populates="suggestions")
    skill: Optional["Skill"] = Relationship(back_populates="suggestions")
