""" This module includes all the models for the student suggestions
"""

from enum import Enum
from typing import Optional

from app.config import config
from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel


class SuggestionOption(int, Enum):
    """represents the different types of suggestions you can make
    """
    NO = 0
    MAYBE = 1
    YES = 2


class Suggestion(SQLModel, table=True):
    """represents a Suggestion from the database
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    decision: SuggestionOption
    reason: str

    student_id: int = Field(foreign_key="student.id")
    suggested_by_id: int = Field(foreign_key="user.id")

    project_id: Optional[int] = Field(default=None, foreign_key="project.id")
    skill_name: Optional[str] = Field(default=None, foreign_key="skill.name")

    student: "Student" = Relationship(back_populates="suggestions")
    suggested_by: "User" = Relationship(back_populates="suggestions")
    project: Optional["Project"] = Relationship(back_populates="suggestions")
    skill: Optional["Skill"] = Relationship(back_populates="suggestions")


class SuggestionCreate(BaseModel):
    """the expected input model (in the body of a HTML POST request) for creating a Suggestion
    """
    decision: SuggestionOption
    reason: str

    student_id: int
    project_id: Optional[int]


class SuggestionExtended(BaseModel):
    """an output model for a Suggestion
    """
    decision: int
    reason: str

    student_id: str
    suggested_by_id: str
    project_id: Optional[str]

    def __init__(self, **data):
        """the constructor
            the kwargs in "data" are used to initialize the attributes of this class
        """
        data["student_id"] = f"{config.api_url}students/{str(data['student_id'])}"
        data["suggested_by_id"] = f"{config.api_url}users/{str(data['suggested_by_id'])}"
        if data['project_id']:
            data["project_id"] = f"{config.api_url}project/{str(data['project_id'])}"
        super().__init__(**data)
