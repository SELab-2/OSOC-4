from typing import Optional

from app.config import config
from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel


class Participation(SQLModel, table=True):
    student_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="student.id")
    project_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="project.id")
    skill_name: Optional[str] = Field(default=None, foreign_key="skill.name")
    reason: Optional[str] = Field(default=None)

    student: "Student" = Relationship(back_populates="participations")
    project: "Project" = Relationship(back_populates="participations")
    skill: "Skill" = Relationship(back_populates="participations")


class ParticipationCreate(BaseModel):
    student_id: int
    project_id: int
    skill_name: Optional[str]
    reason: Optional[str]

    def __init__(self, **data):
        data["skill_name"] = None if data["skill_name"] == "" else data["skill_name"]
        super().__init__(**data)


class ParticipationOutStudent(BaseModel):
    project: str
    skill: Optional[str] = ""
    reason: Optional[str] = ""

    def __init__(self, **data):
        data["project"] = f"{config.api_url}projects/{str(data['project_id'])}"
        data["skill"] = data["skill_name"]
        super().__init__(**data)


class ParticipationOutProject(BaseModel):
    student: str
    skill: Optional[str] = ""
    reason: Optional[str] = ""

    def __init__(self, **data):
        data["student"] = f"{config.api_url}students/{str(data['student_id'])}"
        data["skill"] = data["skill_name"]
        super().__init__(**data)
