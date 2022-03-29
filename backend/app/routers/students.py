from typing import List

from app.crud import read_all_where, read_where
from app.database import get_session
from app.models.student import Student, StudentOutExtended, StudentOutSimple
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import list_modeltype_response
from fastapi import APIRouter, Depends
from odmantic import ObjectId
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import Session, select

router = APIRouter(prefix="/students")
router.dependencies.append(Depends(RoleChecker(UserRole.COACH)))


def get_sorting(sortstr: str):
    sorting = [t.split("+") if "+" in t else [t, "asc"] for t in sortstr.split(",")]
    return {t[0]: 1 if t[1] == "asc" else -1 for t in sorting}


@router.get("/", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Students retrieved", response_model=List[StudentOutSimple])
async def get_students(orderby: str = "name+asc", skills: str = "", alumn: bool = None, search: str = "a", session: AsyncSession = Depends(get_session)):
    """get_students get all the Student instances from the database
    :query parameters:
        :orderby -> str of keys of student + direction to sort by
    :return: list of students
    :rtype: dict
    """

    studs = await read_all_where(Student, session=session)
    print(studs)

    statement = select(Student).where(Student.__ts_vector__.match("lea"))

    res = await session.execute(statement)
    res = [value for (value,) in res.all()]
    print(res)
    return res

    res = await session.execute()
    print(res)
    return res
    return await read_all_where(Student, session=session)

@router.get("/{student_id}", response_description="Student retrieved", response_model=StudentOutExtended)
async def get_student(student_id, session: AsyncSession = Depends(get_session)):
    """get_student get the Student instances with id from the database

    :return: student with id
    :rtype: StudentOutExtended
    """
    result = await read_where(Student, Student.id == int(student_id), session=session)
    return result
