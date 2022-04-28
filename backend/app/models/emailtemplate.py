from typing import Optional

from app.config import config
from sqlmodel import Field, Relationship, SQLModel


class EmailTemplateName(int, Enum):
    YES_DECISION = 2
    MAYBE_DECISION = 1
    NO_DECISION = 0

class EmailTemplate(SQLModel, table=True):
    name: EmailTemplateName = Field(default=None, primary_key=True)
    template: str

class EmailTemplatePatch(SQLModel, table=True):
    template: str = ""
