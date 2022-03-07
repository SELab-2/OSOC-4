from app.models.student_form import StudentForm
from app.models.project import Project
from app.models.role import Role
from odmantic import Model, Reference


class Participation(Model):
    student_form: StudentForm = Reference()
    project: Project = Reference()
    role: Role = Reference()
