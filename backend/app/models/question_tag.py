""" This module includes all the models for the question tags
"""

from typing import Optional

from pydantic import BaseModel, validator
from sqlmodel import Field, Relationship, SQLModel


class QuestionTag(SQLModel, table=True):
    """represents a QuestionTag from the database
        a questiontag provides meaning (a tag) to a question
    """
    tag: str = Field(primary_key=True)
    edition: int = Field(primary_key=True, foreign_key="edition.year")
    question_id: Optional[int] = Field(default=None, foreign_key="question.id")
    mandatory: bool = False
    show_in_list: bool = False

    question: "Question" = Relationship(back_populates="question_tags")


class QuestionTagCreate(BaseModel):
    """the expected input model (in the body of a HTML POST request) for creating a QuestionTag
    """
    tag: str


class QuestionTagSimpleOut(BaseModel):
    """an output model for a QuestionTag
    """
    tag: str
    question: str
    mandatory: bool
    show_in_list: bool

    @validator("tag", pre=True, always=True)
    def check_tag(cls, tag: str) -> str:
        """validates a tag name

        :param tag: the tag name
        :type tag: str
        :return: the tag name
        :rtype: str
        """
        assert tag, "tag cannot be empty."
        return tag


class QuestionTagUpdate(BaseModel):
    """the expected input model (in the body of a HTML PATCH request) for editing a QuestionTag

    :param BaseModel: _description_
    :type BaseModel: _type_
    """
    tag: str
    question: str
    show_in_list: bool
    mandatory: bool
