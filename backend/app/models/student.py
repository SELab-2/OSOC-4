from typing import List, Optional

from app.config import config
from app.models.edition import Edition
from app.models.participation import Participation
from app.models.question_answer import QuestionAnswer
from app.models.suggestion import Suggestion
from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel


class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    edition_year: Optional[int] = Field(default=None, foreign_key="edition.year")
    edition: Optional[Edition] = Relationship(back_populates="students")

    suggestions: List[Suggestion] = Relationship(back_populates="student")
    participations: List[Participation] = Relationship(back_populates="student")
    question_answers: List[QuestionAnswer] = Relationship(back_populates="student")

    # email: str
    # name: str
    # nickname: Optional[str] = ""
    # phone_number: str
    # alumn = False
    # cv: str
    # question_answers: List[int]
    # skills: List[int]  # role from skill.py
    # edition: int

    # __ts_vector__ = Column(TSVector(), Computed("to_tsvector('english', name || ' ' || email || ' ' || nickname)", persisted=True))
    # __table_args__ = (Index('ix_student___ts_vector__', __ts_vector__, postgresql_using='gin'), )


class StudentOutSimple(BaseModel):
    id: str

    def __init__(self, **data):
        data["id"] = config.api_url + "students/" + str(data["id"])
        super().__init__(**data)


class StudentOutExtended(BaseModel):
    id: str
    # email: str
    name: str
    # nickname: Optional[str] = ""
    # phone_number: str
    # question_answers: Optional[List[str]]
    # skills: Optional[List[str]]
    # edition: Optional[str]

    def __init__(self, **data):
        data["id"] = config.api_url + "students/" + str(data["id"])
        # data["question_answers"] = [config.api_url + "question_answers/" + qa for qa in data["question_answers"]]
        # data["skills"] = [config.api_url + "roles/" + skill for skill in data["skills"]]
        # data["edition"] = config.api_url + "editions/" + str(data["edition"])
        super().__init__(**data)
