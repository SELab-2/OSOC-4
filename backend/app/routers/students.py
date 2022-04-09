from app.config import config
from app.database import get_session
from app.models.answer import Answer
from app.models.question_answer import QuestionAnswer
from app.models.question_tag import QuestionTag
from app.models.student import Student
from app.models.suggestion import Suggestion, SuggestionExtended
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

router = APIRouter(prefix="/students")

router.dependencies.append(Depends(RoleChecker(UserRole.COACH)))


@router.get("/{student_id}", response_description="Student retrieved")
async def get_student(student_id, session: AsyncSession = Depends(get_session)):
    """get_student get the Student instances with id from the database

    :return: student with id
    :rtype: StudentOutExtended
    """

    # student info
    info = {"id": f"{config.api_url}students/{student_id}"}
    # student info from tags
    r = await session.execute(select(QuestionTag.tag, Answer.answer).select_from(Student).where(Student.id == int(student_id)).join(QuestionAnswer).join(QuestionTag, QuestionAnswer.question_id == QuestionTag.question_id).join(Answer))
    student_info = r.all()
    info.update({k: v for (k, v) in student_info})
    # student suggestions
    r = await session.execute(select(Suggestion).select_from(Suggestion).where(Suggestion.student_id == int(student_id)))
    student_info = r.all()

    suggestions = []
    suggestion_count = {0: 0, 1: 0, 2: 0}
    for (s,) in student_info:
        suggestion_count[s.decision] += 1
        suggestions.append(SuggestionExtended.parse_raw(s.json()))

    info["suggestion_counts"] = suggestion_count
    info["suggestions"] = suggestions

    return info
