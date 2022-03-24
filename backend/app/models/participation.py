from odmantic import Model, ObjectId


class Participation(Model):
    student: ObjectId
    project: ObjectId
    skill: ObjectId
