from enum import Enum
from typing import List, Optional

from app.config import config
from app.models.edition import Edition
from app.models.participation import Participation
from app.models.question_answer import QuestionAnswer
from app.models.skill import Skill, StudentSkill
from app.models.suggestion import Suggestion
from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel


class DecisionOption(int, Enum):
    """represents the different types of decisions you can take for a student
    """
    UNDECIDED = -1
    NO = 0
    MAYBE = 1
    YES = 2


class Student(SQLModel, table=True):
    """represents a Student from the database
            any aditional data about the students gets stored in the QuestionAnswers
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    edition_year: Optional[int] = Field(default=None, foreign_key="edition.year")
    edition: Optional[Edition] = Relationship(back_populates="students")

    decision: Optional[DecisionOption] = DecisionOption.UNDECIDED
    email_sent: bool = False

    suggestions: List[Suggestion] = Relationship(back_populates="student")
    participations: List[Participation] = Relationship(back_populates="student")
    question_answers: List[QuestionAnswer] = Relationship(back_populates="student")

    skills: List[Skill] = Relationship(back_populates="students", link_model=StudentSkill)


class StudentOutSimple(BaseModel):
    """an output model for a Student
    """
    id: str

    def __init__(self, **data):
        """the constructor
            the kwargs in "data" are used to initialize the attributes of this class
        """
        data["id"] = config.api_url + "students/" + str(data["id"])
        super().__init__(**data)


class StudentUpdate(BaseModel):
    """the expected input model (in a HTML PATCH request) for editing a Student
    """
    decision: DecisionOption
