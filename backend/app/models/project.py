""" This module includes all the models for projects
"""

from typing import Dict, List, Optional

from app.config import config
from app.models.participation import Participation, ParticipationOutProject
from app.models.suggestion import Suggestion
from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel


class ProjectCoach(SQLModel, table=True):
    """represents a ProjectCoach from the database
        a project-coach is the relationship between a project and a coach,
        it defines which coach belongs to what project
    """
    project_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="project.id")
    coach_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="user.id")


class ProjectRequiredSkill(SQLModel, table=True):
    """represents a ProjectRequiredSkill from the database
        a project-required-skill is the relationship between a project and a skill,
        it defines what skill is needed in which project and how many times that skill is needed there
    """
    project_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="project.id")
    skill_name: Optional[str] = Field(default=None, primary_key=True, foreign_key="skill.name")

    project: "Project" = Relationship(back_populates="required_skills")
    skill: "Skill" = Relationship(back_populates="projects")

    number: int


class Project(SQLModel, table=True):
    """represents a Project from the database
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    edition: int = Field(foreign_key="edition.year")

    name: str
    description: str

    partner_name: str
    partner_description: str

    coaches: List["User"] = Relationship(back_populates="projects", link_model=ProjectCoach)
    required_skills: List[ProjectRequiredSkill] = Relationship(back_populates="project")
    suggestions: List[Suggestion] = Relationship(back_populates="project")
    participations: List[Participation] = Relationship(back_populates="project")


class RequiredSkillOut(BaseModel):
    """an output model for ProjectRequiredSkill
    """
    skill_name: str
    number: int


class ProjectCreate(BaseModel):
    """the expected input model (in the body of a HTML POST request) for creating a new project
    """
    name: str
    description: str
    required_skills: List[RequiredSkillOut]
    partner_name: str
    partner_description: str
    edition: int
    users: List[int]


class ProjectOutSimple(BaseModel):
    """an output model for Project
    """
    id: str

    def __init__(self, **data):
        """the constructor
            the kwargs in "data" are used to initialize the attributes of this class
        """
        data["id"] = config.api_url + "projects/" + str(data["id"])
        super().__init__(**data)


class ProjectOutExtended(BaseModel):
    """an extended output model for Project (gives more info)
    """
    id: str
    id_int: int
    name: str
    description: str
    partner_name: str
    partner_description: str
    required_skills: List[RequiredSkillOut] = []
    users: List[str] = []
    participations: Dict[int, ParticipationOutProject] = {}
    edition: str

    def __init__(self, **data):
        """the constructor
            the kwargs in "data" are used to initialize the attributes of this class
        """
        i = data["id"]
        data["id"] = config.api_url + "projects/" + str(data["id"])
        data["id_int"] = i
        data["edition"] = config.api_url + "editions/" + str(data["edition"])
        super().__init__(**data)
