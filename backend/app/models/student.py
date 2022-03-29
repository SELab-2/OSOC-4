from typing import List, Optional

import sqlalchemy as sa
from app.config import config
from pydantic import BaseModel
from sqlalchemy import Column, Computed, Index, desc
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlmodel import Field, SQLModel


class TSVector(sa.types.TypeDecorator):
    impl = TSVECTOR


class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    name: str
    nickname: Optional[str] = ""
    phone_number: str
    # alumn = False
    # cv: str
    # question_answers: List[int]
    # skills: List[int]  # role from skill.py
    edition: int

    __ts_vector__ = Column(TSVector(), Computed("to_tsvector('english', name || ' ' || email || ' ' || nickname)", persisted=True))
    __table_args__ = (Index('ix_student___ts_vector__', __ts_vector__, postgresql_using='gin'), )


class StudentOutSimple(BaseModel):
    id: str

    def __init__(self, **data):
        data["id"] = config.api_url + "students/" + str(data["id"])
        super().__init__(**data)


class StudentOutExtended(BaseModel):
    id: str
    email: str
    name: str
    nickname: Optional[str] = ""
    phone_number: str
    question_answers: Optional[List[str]]
    skills: Optional[List[str]]
    edition: Optional[str]

    def __init__(self, **data):
        data["id"] = config.api_url + "students/" + str(data["id"])
        #data["question_answers"] = [config.api_url + "question_answers/" + qa for qa in data["question_answers"]]
        #data["skills"] = [config.api_url + "roles/" + skill for skill in data["skills"]]
        #data["edition"] = config.api_url + "editions/" + str(data["edition"])
        super().__init__(**data)
