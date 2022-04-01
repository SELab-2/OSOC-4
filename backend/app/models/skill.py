from typing import Optional

from sqlmodel import Field, SQLModel


class Skill(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    name: str
