from odmantic import Model
from odmantic.bson import ObjectId

from typing import List


class QuestionAnswer(Model):
    question: ObjectId
    answer: List[ObjectId]
