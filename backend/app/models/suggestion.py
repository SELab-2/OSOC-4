from enum import Enum
from typing import Optional
from odmantic import Model
from bson import ObjectId
from pydantic import validator


class SuggestionOption(int, Enum):
    NO = 0
    MAYBE = 1
    YES = 2


class Suggestion(Model):
    suggestion: SuggestionOption
    reason: str
    student_form: ObjectId
    suggested_by: ObjectId
    project: Optional[ObjectId]
    role: Optional[ObjectId]
    confirmed: bool

    @validator("confirmed")
    def check_confirmed_by_admin(cls, field_value, values, field, config):
        if field_value and not values["suggested_by"].is_admin:
            raise ValueError("Only admins can confirm a suggestion")
