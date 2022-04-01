from typing import List

from app.config import config
from app.database import get_session
from app.models.answer import Answer
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
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

    query = select(QuestionAnswer.student).join(Answer).where(Answer.answer.ilike("%" + search + "%")).distinct()
    res = await session.execute(query)
    res = res.all()
    print(res)

    return [config.api_url + "students/" + str(id) for (id,) in res]


@router.get("/{student_id}", response_description="Student retrieved")
async def get_student(student_id, session: AsyncSession = Depends(get_session)):
    """get_student get the Student instances with id from the database

    :return: student with id
    :rtype: StudentOutExtended
    """

    tags = ["name"]

    # get the studentname
    query = select(QuestionAnswer, Question.tag, Answer.answer).where(QuestionAnswer.student == int(student_id)).join(Question).where(Question.tag.in_(tags)).join(Answer)
    res = await session.execute(query)
    res = res.all()
    res_dict = {tag: answer for (_, tag, answer,) in res}
    print(res_dict)
    return res_dict
