from typing import List, Optional

from odmantic import ObjectId
from ..database import engine
from ..models.student_form import StudentForm


async def add_studentform(student_form: StudentForm) -> StudentForm:
    await engine.save(student_form)
    return student_form


async def get_studentform_with_id(id: str) -> Optional[StudentForm]:
    res = await engine.find_one(StudentForm, StudentForm.id == ObjectId(id))
    return res


async def get_all_studentforms() -> List[StudentForm]:
    results = await engine.find(StudentForm)
    return results
