from odmantic import Model, ObjectId


class Participation(Model):
    student_form: ObjectId
    project: ObjectId
    role: ObjectId
