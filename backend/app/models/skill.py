""" This module includes all the models for the skills
"""

from typing import List, Optional

from app.models.participation import Participation
from app.models.project import ProjectRequiredSkill
from app.models.suggestion import Suggestion
from sqlmodel import Field, Relationship, SQLModel


class StudentSkill(SQLModel, table=True):
    """represents a StudentSkill from the database
        a student-skill is a relationship between a student and a skill,
        it defines what skill which student has
    """
    student_id: Optional[int] = Field(default=None, foreign_key="student.id", primary_key=True)
    skill_name: Optional[str] = Field(default=None, foreign_key="skill.name", primary_key=True)


class Skill(SQLModel, table=True):
    """represents a skill from the database
    """
    name: str = Field(primary_key=True)

    projects: List[ProjectRequiredSkill] = Relationship(back_populates="skill")
    suggestions: List[Suggestion] = Relationship(back_populates="skill")
    participations: List[Participation] = Relationship(back_populates="skill")

    students: List["Student"] = Relationship(back_populates="skills", link_model=StudentSkill)
