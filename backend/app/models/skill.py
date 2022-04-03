from typing import List

from app.models.participation import Participation
from app.models.project import ProjectRequiredSkill
from app.models.suggestion import Suggestion
from sqlmodel import Field, Relationship, SQLModel


class Skill(SQLModel, table=True):
    name: str = Field(primary_key=True)

    projects: List[ProjectRequiredSkill] = Relationship(back_populates="skill")
    suggestions: List[Suggestion] = Relationship(back_populates="skill")
    participations: List[Participation] = Relationship(back_populates="skill")
