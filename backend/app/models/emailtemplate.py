""" This module includes all the models for the email templates
"""

from enum import Enum

from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class EmailTemplateName(int, Enum):
    """represents a name for an email template
    """
    YES_DECISION = 2
    MAYBE_DECISION = 1
    NO_DECISION = 0
    UNDECIDED = -1


class EmailTemplate(SQLModel, table=True):
    """represents an email template from the database
    """
    name: EmailTemplateName = Field(default=None, primary_key=True)
    subject: str = ""
    template: str = ""


class EmailTemplatePatch(BaseModel):
    """the expected input model (in the body of a HTML PATCH request) for editing an email template
    """
    subject: str = ""
    template: str = ""
