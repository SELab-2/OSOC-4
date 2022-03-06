from enum import Enum
from app.models.student_form import StudentForm
from app.models.coach import Coach
from typing import Optional
from odmantic import Model, Reference
from bson import ObjectId
from pydantic import validator


class DecisionOption(int, Enum):
    NO = 0
    MAYBE = 1
    YES = 2


class Decision(Model):
    decision: DecisionOption
    reason: str
    project: Optional[ObjectId]
    student_form: StudentForm = Reference()
    decided_by: Coach = Reference()

    @validator("decision")
    def check_project_not_null_if_yes(cls, field_value, values, field, config):
        if field_value == 2 and values["project"] is None:
            raise ValueError("Accepted student, but no project found")
