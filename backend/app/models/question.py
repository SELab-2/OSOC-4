from pydantic import BaseModel, Field
from typing import Optional
from odmantic import Model


class Question(Model):

    question: str
    field_id: str
    type: str
