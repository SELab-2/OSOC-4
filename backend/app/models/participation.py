from typing import Optional
from app.config import config
from sqlmodel import Field, SQLModel, Relationship
from pydantic import BaseModel


class Participation(SQLModel, table=True):
    student_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="student.id")
    project_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="project.id")
    skill_name: str = Field(foreign_key="skill.name")

    student: "Student" = Relationship(back_populates="participations")
    project: "Project" = Relationship(back_populates="participations")
    skill: "Skill" = Relationship(back_populates="participations")


class ParticipationOutStudent(BaseModel):
    project: str
    skill: str

    def __init__(self, **data):
        data["project"] = f"{config.api_url}projects/{str(data['project_id'])}"
        data["skill"] = data["skill_name"]
        super().__init__(**data)


class ParticipationOutProject(BaseModel):
    student: str
    skill: str

    def __init__(self, **data):
        data["student"] = f"{config.api_url}students/{str(data['student_id'])}"
        data["skill"] = data["skill_name"]
        super().__init__(**data)
