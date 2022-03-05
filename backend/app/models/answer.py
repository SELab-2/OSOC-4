from .question import Question
from typing import Optional
from odmantic import Model, Reference
from odmantic.bson import ObjectId


class Answer(Model):
    questionid: ObjectId
    text: str
