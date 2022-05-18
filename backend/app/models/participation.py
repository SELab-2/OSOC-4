from typing import Optional

from app.config import config
from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel


class Participation(SQLModel, table=True):
    """represents a participation from the database
        a participation is a relationship between a student and a project,
        it defines what role the student might take on,
        and for what reason the student was added to that project
    """
    student_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="student.id")
    project_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="project.id")
    skill_name: Optional[str] = Field(default=None, foreign_key="skill.name")
    reason: Optional[str] = Field(default=None)

    student: "Student" = Relationship(back_populates="participations")
    project: "Project" = Relationship(back_populates="participations")
    skill: "Skill" = Relationship(back_populates="participations")


class ParticipationCreate(BaseModel):
    """the expected input model (in the body of a HTML POST request) for creating a new Participation 
    """
    student_id: int
    project_id: int
    skill_name: Optional[str]
    reason: Optional[str]

    def __init__(self, **data):
        """the constructor
            the kwargs in "data" are used to initialize the attributes of this class
        """
        data["skill_name"] = None if data["skill_name"] == "" else data["skill_name"]
        super().__init__(**data)


class ParticipationOutStudent(BaseModel):
    """an output model for a participation for a student, 
        defines what attributes of a participation are send to the outside world when retrieving a student
    """
    project: str
    skill: Optional[str] = ""
    reason: Optional[str] = ""

    def __init__(self, **data):
        """the constructor
            the kwargs in "data" are used to initialize the attributes of this class
        """
        data["project"] = f"{config.api_url}projects/{str(data['project_id'])}"
        data["skill"] = data["skill_name"]
        super().__init__(**data)


class ParticipationOutProject(BaseModel):
    """an output model for a participation for a project, 
        defines what attributes of a participation are send to the outside world when retrieving a project
    """
    student: str
    skill: Optional[str] = ""
    reason: Optional[str] = ""

    def __init__(self, **data):
        """the constructor
            the kwargs in "data" are used to initialize the attributes of this class
        """
        data["student"] = f"{config.api_url}students/{str(data['student_id'])}"
        data["skill"] = data["skill_name"]
        super().__init__(**data)
