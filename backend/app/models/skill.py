from typing import Optional

from sqlmodel import Field, SQLModel


class Skill(SQLModel):
    id: Optional[int] = Field(primary_key=True)
    name: str
