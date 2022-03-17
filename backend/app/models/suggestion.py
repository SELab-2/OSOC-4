from enum import Enum
from typing import Optional
from odmantic import Model
from bson import ObjectId


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
