from odmantic import Model
from odmantic.bson import ObjectId


class Answer(Model):
    question_id: ObjectId  # id in the database
    field_id: str  # id from the form
    answer: str
