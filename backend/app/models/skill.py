from typing import List
from sqlmodel import Field, SQLModel, Relationship
from app.models.project import ProjectRequiredSkill
from app.models.suggestion import Suggestion
from app.models.participation import Participation


class Skill(SQLModel, table=True):
    name: str = Field(primary_key=True)

    projects: List[ProjectRequiredSkill] = Relationship(back_populates="skill")
    suggestions: List[Suggestion] = Relationship(back_populates="skill")
    participations: List[Participation] = Relationship(back_populates="skill")
