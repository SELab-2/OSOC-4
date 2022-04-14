from app.config import config
from app.database import get_session
from app.models.answer import Answer
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.question_tag import QuestionTag
from app.models.student import Student
from app.models.suggestion import (MySuggestionOut, Suggestion,
                                   SuggestionExtended)
from app.models.user import UserRole
from app.utils.checkers import EditionChecker, RoleChecker
from fastapi import APIRouter, Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

router = APIRouter(prefix="/students")

router.dependencies.append(Depends(RoleChecker(UserRole.COACH)))


@router.get("/{student_id}", response_description="Student retrieved")
async def get_student(student_id, session: AsyncSession = Depends(get_session), Authorize: AuthJWT = Depends()):
    """get_student get the Student instances with id from the database

    :return: student with id
    :rtype: StudentOutExtended
    """

    # student info
    info = {"id": f"{config.api_url}students/{student_id}"}

    info["id_int"] = student_id

    # student info from tags
    r = await session.execute(select(QuestionTag.tag, QuestionTag.mandatory, QuestionTag.showInList, Answer.answer).select_from(Student).where(Student.id == int(student_id)).join(QuestionAnswer).join(QuestionTag, QuestionAnswer.question_id == QuestionTag.question_id).join(Answer))
    student_info = r.all()

    mandatory = {k: v for (k, mandatory, _, v) in student_info if mandatory}
    listTags = {k: v for (k, mandatory, showInList, v) in student_info if showInList and not mandatory}
    detailTags = {k: v for (k, mandatory, showInList, v) in student_info if not showInList and not mandatory}

    info["mandatory"] = mandatory
    info["listtags"] = listTags
    info["detailtags"] = detailTags
    # student suggestions
    r = await session.execute(select(Suggestion).select_from(Suggestion).where(Suggestion.student_id == int(student_id)))
    student_info = r.all()
    # student questionAnswers
    info["question-answers"] = f"{config.api_url}students/{student_id}/question-answers"

    suggestions = {}
    info["own_suggestion"] = None
    for (s,) in student_info:
        suggestions[s.id] = SuggestionExtended.parse_raw(s.json())
        if s.suggested_by_id == Authorize.get_jwt_subject():
            info["own_suggestion"] = MySuggestionOut.parse_raw(s.json())
    info["suggestions"] = suggestions


    return info


@router.get("/{student_id}/question-answers", response_description="Student retrieved")
async def get_student_questionanswers(student_id, session: AsyncSession = Depends(get_session)):
    """get_student get the Student instances with id from the database

    :return: student with id
    :rtype: StudentOutExtended
    """
    # student questionAnswers
    r = await session.execute(select(Question.question, Answer.answer, QuestionTag.tag).select_from(QuestionAnswer)
                              .join(Question, QuestionAnswer.question)
                              .join(Answer, QuestionAnswer.answer)
                              .outerjoin(QuestionTag, Question.question_tags)
                              .where(QuestionAnswer.student_id == int(student_id)))
    info = r.all()
    info = [{"question": x[0], "answer":x[1]} for x in info if x[2] is None]

    return info
