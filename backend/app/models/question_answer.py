from odmantic import Model
from odmantic.bson import ObjectId


class QuestionAnswer(Model):
    question: ObjectId
    answer: ObjectId
