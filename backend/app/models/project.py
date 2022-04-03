from typing import List, Optional

from app.config import config
from pydantic import BaseModel
from sqlmodel import Field, SQLModel, Relationship
from app.models.suggestion import Suggestion
from app.models.participation import Participation


class ProjectCoach(SQLModel, table=True):
    project_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="project.id")
    coach_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="user.id")


class ProjectRequiredSkill(SQLModel, table=True):
    project_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="project.id")
    skill_name: Optional[str] = Field(default=None, primary_key=True, foreign_key="skill.name")

    project: "Project" = Relationship(back_populates="required_skills")
    skill: "Skill" = Relationship(back_populates="projects")

    number: int


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    edition: int = Field(foreign_key="edition.year")

    name: str
    description: str
    goals: List["ProjectGoal"] = Relationship(back_populates="project")

    partner_name: str
    partner_description: str

    coaches: List["User"] = Relationship(back_populates="projects", link_model=ProjectCoach)
    required_skills: List[ProjectRequiredSkill] = Relationship(back_populates="project")
    suggestions: List[Suggestion] = Relationship(back_populates="project")
    participations: List[Participation] = Relationship(back_populates="project")


class ProjectGoal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    goal: str

    project_id: Optional[int] = Field(foreign_key="project.id")
    project: Optional[Project] = Relationship(back_populates="goals")


class PartnerOut(BaseModel):
    name: str
    about: str


class RequiredSkillOut(BaseModel):
    skill: str
    number: int


class ProjectCreate(BaseModel):
    name: str
    description: str
    goals: List[str]
    # required_skills: List[RequiredSkills]
    partner_name: str
    partner_description: str
    users: List[int] = []
    edition: int


class ProjectOutSimple(BaseModel):
    id: str
    name: str

    def __init__(self, **data):
        data["id"] = config.api_url + "projects/" + data["id"]
        super().__init__(**data)


class ProjectOutExtended(BaseModel):
    id: str
    name: str
    description: str
    goals: List[str]
    partner_name: str
    partner_description: str
    # required_skills: List[RequiredSkills]
    users: List[str]
    edition: str

    def __init__(self, **data):
        data["id"] = config.api_url + "projects/" + data["id"]
        data["users"] = [config.api_url + "users/" + user for user in data["users"]]
        data["edition"] = config.api_url + "editions/" + str(data["edition"])
        super().__init__(**data)
