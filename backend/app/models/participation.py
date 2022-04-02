from typing import Optional
from sqlmodel import Field, SQLModel, Relationship


class Participation(SQLModel, table=True):
    student_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="student.id")
    project_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="project.id")
    skill_name: str = Field(foreign_key="skill.name")

    student: "Student" = Relationship(back_populates="participations")
    project: "Project" = Relationship(back_populates="participations")
    skill: "Skill" = Relationship(back_populates="participations")
