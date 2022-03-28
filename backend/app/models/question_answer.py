from odmantic import EmbeddedModel
from odmantic.bson import ObjectId


class QuestionAnswer(EmbeddedModel):
    question: ObjectId
    answer: ObjectId
