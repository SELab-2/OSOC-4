from app.config import config
from app.crud import delete, read_all_where, read_where, update
from app.database import get_session, websocketManager
from app.exceptions.edition_exceptions import StudentNotFoundException
from app.models.answer import Answer
from app.models.participation import Participation, ParticipationOutStudent
from app.models.question import Question
from app.models.question_answer import QuestionAnswer
from app.models.question_tag import QuestionTag
from app.models.skill import StudentSkill
from app.models.student import Student, StudentUpdate
from app.models.suggestion import Suggestion, SuggestionExtended
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.response import response
from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select

router = APIRouter(prefix="/students")

router.dependencies.append(Depends(RoleChecker(UserRole.COACH)))


@router.get("/{student_id}", response_description="Student retrieved",
            dependencies=[Depends(RoleChecker(UserRole.COACH))])
async def get_student(student_id: int, session: AsyncSession = Depends(get_session)):
    """get_student get the Student instances with id from the database

    :return: student with id
    :rtype: StudentOutExtended
    """

    student = await read_where(Student, Student.id == student_id, session=session)
    if not student:
        raise StudentNotFoundException

    studentstat = select(Student).where(Student.id == student_id).options(selectinload(Student.skills))
    studentres = await session.execute(studentstat)
    (student,) = studentres.one()

    # student info
    info = {"id": f"{config.api_url}students/{student_id}",
            "skills": student.skills,
            "id_int": student_id,
            "email_sent": student.email_sent}

    # student info from tags
    r = await session.execute(select(QuestionTag.tag, QuestionTag.mandatory, QuestionTag.show_in_list, Answer.answer)
                              .select_from(Student)
                              .where(Student.id == int(student_id))
                              .join(QuestionAnswer)
                              .join(QuestionTag, QuestionAnswer.question_id == QuestionTag.question_id)
                              .join(Answer))
    student_info = r.all()

    mandatory = {k: v for (k, mandatory, _, v) in student_info if mandatory}
    listTags = {k: v for (k, mandatory, show_in_list, v) in student_info if show_in_list and not mandatory}
    detailTags = {k: v for (k, mandatory, show_in_list, v) in student_info if not show_in_list and not mandatory}

    info["mandatory"] = mandatory
    info["listtags"] = listTags
    info["detailtags"] = detailTags

    # student participations
    r = await session.execute(select(Participation)
                              .select_from(Participation)
                              .where(Participation.student_id == int(student_id)))
    info["participations"] = [ParticipationOutStudent.parse_raw(s.json()) for (s,) in r.all()]
    # student questionAnswers
    info["question-answers"] = f"{config.api_url}students/{student_id}/question-answers"

    info["decision"] = student.decision

    # student suggestions
    r = await session.execute(select(Suggestion)
                              .select_from(Suggestion)
                              .where(Suggestion.student_id == int(student_id)))
    info["suggestions"] = {s.id: SuggestionExtended.parse_raw(s.json()) for (s,) in r.all()}

    return info


@router.get("/{student_id}/question-answers", response_description="Student retrieved",
            dependencies=[Depends(RoleChecker(UserRole.COACH))])
async def get_student_questionanswers(student_id, session: AsyncSession = Depends(get_session)):
    """get the question answers of the Student instance with id

    :return: the question answers for the given student_id
    :rtype: list[dict[str,Any]]
    """
    # student questionAnswers
    r = await session.execute(select(Question.question, Answer.answer, QuestionTag.tag)
                              .select_from(QuestionAnswer)
                              .join(Question, QuestionAnswer.question)
                              .join(Answer, QuestionAnswer.answer)
                              .outerjoin(QuestionTag, Question.question_tags)
                              .where(QuestionAnswer.student_id == int(student_id)))
    return [{"question": x[0], "answer": x[1]} for x in r.all() if x[2] is None]


@router.patch("/{student_id}",
              dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def update_student(student_id: int, student_update: StudentUpdate, session: AsyncSession = Depends(get_session)):
    student = await read_where(Student, Student.id == student_id, session=session)
    if student:
        student_update_data = student_update.dict(exclude_unset=True)

        prev_decision = student.decision
        for key, value in student_update_data.items():
            setattr(student, key, value)

        if prev_decision != student_update.decision:
            student.email_sent = False
        await update(student, session)

        await websocketManager.broadcast({"id": config.api_url + "students/" + str(student_id),
                                          "decision": jsonable_encoder(StudentUpdate.parse_raw(student.json()))})

        return response(None, "Student updated succesfully")

    raise StudentNotFoundException()


@router.delete("/{student_id}", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def delete_student(student_id: str, session: AsyncSession = Depends(get_session)):
    """delete_student this deletes a student

    :param student_id: the user id
    :type student_id: str
    :raises NotPermittedException: Unauthorized
    :return: response
    :rtype: success or error
    """

    student = await read_where(Student, Student.id == int(student_id), session=session)
    student_id = int(student_id)

    if student is None:
        raise StudentNotFoundException()
    else:
        # order of deletion should be:
        # questionanswer
        # studentskill
        # suggestion
        # participation
        # student
        # Sorry figuring out how to cascade was hard.
        for obj in await read_all_where(QuestionAnswer, QuestionAnswer.student_id == student_id, session=session):
            await session.delete(obj)
        for obj in await read_all_where(StudentSkill, StudentSkill.student_id == student_id, session=session):
            await session.delete(obj)
        for obj in await read_all_where(Suggestion, Suggestion.student_id == student_id, session=session):
            await session.delete(obj)
        for obj in await read_all_where(Participation, Participation.student_id == student_id, session=session):
            await session.delete(obj)
        for obj in await read_all_where(Student, Student.id == student_id, session=session):
            await session.delete(obj)

        await session.commit()

    await websocketManager.broadcast({"deleted_student": config.api_url + "students/" + str(student_id)})

    return response(None, "Student deleted successfully")
