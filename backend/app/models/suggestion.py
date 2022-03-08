from enum import Enum
from app.models.student_form import StudentForm
from app.models.coach import Coach
from typing import Optional
from odmantic import Model, Reference
from bson import ObjectId
from pydantic import validator


class SuggestionOption(int, Enum):
    NO = 0
    MAYBE = 1
    YES = 2


class Suggestion(Model):
    suggestion: SuggestionOption
    reason: str
    student_form: StudentForm = Reference()
    suggested_by: Coach = Reference()
    project: Optional[ObjectId]
    role: Optional[ObjectId]
    confirmed: bool

    @validator("confirmed")
    def check_confirmed_by_admin(cls, field_value, values, field, config):
        if field_value and not values["suggested_by"].is_admin:
            raise ValueError("Only admins can confirm a suggestion")
