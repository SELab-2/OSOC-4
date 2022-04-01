from typing import Optional

from sqlmodel import Field, SQLModel


class Participation(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    student_id: int = Field(default=None, foreign_key="student.id")
    project_id: int = Field(default=None, foreign_key="project.id")
    skill_id: int = Field(default=None, foreign_key="skill.id")
