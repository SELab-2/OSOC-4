from typing import List, Optional
from ..database import engine
from ..models.student_form import StudentForm


async def add_studentform(student_form: StudentForm) -> StudentForm:
    await engine.save(student_form)
    return student_form
