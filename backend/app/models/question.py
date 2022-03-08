from odmantic import Model


class Question(Model):
    question: str
    field_id: str
    type: str
