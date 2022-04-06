from enum import Enum
from typing import Optional

from pydantic import BaseModel
from sqlmodel import Field, SQLModel, Relationship

from app.config import config

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

class SuggestionExtended(BaseModel):
    decision: int
    definitive: bool
    reason: str

    student_id: str
    suggested_by_id: str
    project_id: str
    skill_name: str

    def __init__(self, **data):
        data["student_id"] = f"{config.api_url}students/{str(data['student_id'])}"
        data["suggested_by_id"] = f"{config.api_url}users/{str(data['suggested_by_id'])}"
        data["project_id"] = f"{config.api_url}project/{str(data['project_id'])}"
        super().__init__(**data)
