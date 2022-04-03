from typing import List

from app.config import config
from app.database import get_session
from app.models.answer import Answer
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.question_tag import QuestionTag
from app.models.student import Student
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

router = APIRouter(prefix="/students")
router.dependencies.append(Depends(RoleChecker(UserRole.COACH)))


def get_sorting(sortstr: str):
    sorting = [t.split("+") if "+" in t else [t, "asc"] for t in sortstr.split(",")]
    return {t[0]: 1 if t[1] == "asc" else -1 for t in sorting}


@router.get("/", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Students retrieved")
async def get_students(orderby: str = "name+asc", skills: str = "", alumn: bool = None, search: str = "", session: AsyncSession = Depends(get_session)):
    """get_students get all the Student instances from the database
    :query parameters:
        :orderby -> str of keys of student + direction to sort by
    :return: list of students
    :rtype: dict
    """

    stat = select(QuestionAnswer.student_id).join(Answer)
    if search:    
        stat = stat.where(Answer.answer.ilike("%" + search + "%"))

    stat = stat.distinct()
    res = await session.execute(stat)
    res = res.all()

    return [config.api_url + "students/" + str(id) for (id,) in res]

@router.get("/{student_id}", response_description="Student retrieved")
async def get_student(student_id, session: AsyncSession = Depends(get_session)):
    """get_student get the Student instances with id from the database

    :return: student with id
    :rtype: StudentOutExtended
    """

    # get the student
    r = await session.execute(select(QuestionTag.tag, Answer.answer).select_from(Student).where(Student.id == int(student_id)).join(QuestionAnswer).join(QuestionTag, QuestionAnswer.question_id == QuestionTag.question_id).join(Answer))
    student_info = r.all()

    return {k: v for (k, v) in student_info}
