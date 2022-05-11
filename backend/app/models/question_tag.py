from typing import Optional

from pydantic import BaseModel, validator
from sqlmodel import Field, Relationship, SQLModel


class QuestionTag(SQLModel, table=True):
    tag: str = Field(primary_key=True)
    edition: int = Field(primary_key=True, foreign_key="edition.year")
    question_id: Optional[int] = Field(default=None, foreign_key="question.id")
    mandatory: bool = False
    show_in_list: bool = False

    question: "Question" = Relationship(back_populates="question_tags")


class QuestionTagCreate(BaseModel):
    tag: str


class QuestionTagSimpleOut(BaseModel):
    tag: str
    question: str
    mandatory: bool
    show_in_list: bool

    @validator("tag", pre=True, always=True)
    def check_tag(cls, tag):
        assert tag, "tag cannot be empty."
        return tag


class UnusedQuestionTagSimpleOut(BaseModel):
    tag: str
    mandatory: bool

    @validator("tag", pre=True, always=True)
    def check_tag(cls, tag):
        assert tag, "tag cannot be empty."
        return tag


class QuestionTagUpdate(BaseModel):
    tag: str
    question: str
    show_in_list: bool
    mandatory: bool
