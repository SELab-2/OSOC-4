from enum import Enum
from typing import Optional
from odmantic import Model
from bson import ObjectId


class SuggestionOption(int, Enum):
    NO = 0
    MAYBE = 1
    YES = 2


class Suggestion(Model):
    # mail_sent: bool
    decision: SuggestionOption
    definitive: bool
    reason: str
    student: ObjectId
    suggested_by: ObjectId
    project: Optional[ObjectId]
    skill: Optional[ObjectId]
