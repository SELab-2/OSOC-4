from app.config import config
from app.database import get_session
from app.models.answer import Answer
from app.models.question import Question
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


@router.get("/", response_description="Students retrieved")
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

    # student info
    info = {"id": f"{config.api_url}students/{student_id}"}
    # student info from tags
    r = await session.execute(select(QuestionTag.tag, Answer.answer).select_from(Student).where(Student.id == int(student_id)).join(QuestionAnswer).join(QuestionTag, QuestionAnswer.question_id == QuestionTag.question_id).join(Answer))
    student_info = r.all()
    info.update({k: v for (k, v) in student_info})
    # student suggestions
    r = await session.execute(select(Suggestion).select_from(Suggestion).where(Suggestion.student_id == int(student_id)))
    student_info = r.all()
    # student questionAnswers
    info["question-answers"] = f"{config.api_url}students/{student_id}/question-answers"
    info["suggestions"] = [SuggestionExtended.parse_raw(s.json()) for (s,) in student_info]

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
