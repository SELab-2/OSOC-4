from typing import Optional

from pydantic import BaseModel, validator
from sqlmodel import Field, Relationship, SQLModel


class QuestionTag(SQLModel, table=True):
    tag: str = Field(primary_key=True)
    edition: int = Field(primary_key=True, foreign_key="edition.year")
    question_id: Optional[int] = Field(default=None, foreign_key="question.id")

    question: "Question" = Relationship(back_populates="question_tags")


class QuestionTagCreate(BaseModel):
    tag: str


class QuestionTagSimpleOut(BaseModel):
    tag: str
    question: str

    @validator("tag", pre=True, always=True)
    def check_tag(cls, tag):
        assert tag, "tag cannot be empty."
        return tag


class QuestionTagUpdate(BaseModel):
    question: str

    @validator("question", pre=True, always=True)
    def check_question(cls, question):
        assert question, "question cannot be empty."
        return question
