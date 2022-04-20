from typing import List, Optional

from app.models.participation import Participation
from app.models.project import ProjectRequiredSkill
from app.models.suggestion import Suggestion
from sqlmodel import Field, Relationship, SQLModel


class StudentSkill(SQLModel, table=True):
    student_id: Optional[int] = Field(
        default=None, foreign_key="student.id", primary_key=True
    )
    skill_name: Optional[str] = Field(
        default=None, foreign_key="skill.name", primary_key=True
    )


class Skill(SQLModel, table=True):
    name: str = Field(primary_key=True)

    projects: List[ProjectRequiredSkill] = Relationship(back_populates="skill")
    suggestions: List[Suggestion] = Relationship(back_populates="skill")
    participations: List[Participation] = Relationship(back_populates="skill")

    students: List["Student"] = Relationship(back_populates="skills", link_model=StudentSkill)
