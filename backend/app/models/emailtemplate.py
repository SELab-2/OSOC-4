from enum import Enum

from pydantic import BaseModel
from sqlmodel import Field, SQLModel


class EmailTemplateName(int, Enum):
    YES_DECISION = 2
    MAYBE_DECISION = 1
    NO_DECISION = 0

class EmailTemplate(SQLModel, table=True):
    name: EmailTemplateName = Field(default=None, primary_key=True)
    template: str = ""

class EmailTemplatePatch(BaseModel):
    template: str = ""

