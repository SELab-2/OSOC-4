""" This module includes the student endpoints """

from typing import List
from collections import defaultdict

from app.config import config
from app.crud import read_all_where, read_where, update
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
async def get_student(student_id: int, session: AsyncSession = Depends(get_session)) -> dict:
    """get_student get the Student instances with id from the database

    :param student_id: _description_
    :type student_id: int
    :param session: _description_, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises StudentNotFoundException: _description_
    :return: Student with info, tags & answers, participations, question-answers, suggestions
    :rtype: dict
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

    mandatoryTags = defaultdict(list)
    listTags = defaultdict(list)
    detailTags = defaultdict(list)

    for tag, mandatory, show_in_list, val in student_info:
        if mandatory:
            mandatoryTags[tag].append(val)
        else:
            if show_in_list:
                listTags[tag].append(val)
            detailTags[tag].append(val)

    info["mandatory"] = {k: ', '.join(v) for k, v in mandatoryTags.items()}
    info["listtags"] = {k: ', '.join(v) for k, v in listTags.items()}
    info["listtags"] = {k: ', '.join(v) for k, v in detailTags.items()}

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
async def get_student_questionanswers(student_id: int, session: AsyncSession = Depends(get_session)) -> List[dict]:
    """get_student_questionanswers get the question answers of the Student instance with id

    :param student_id: the id of the student
    :type student_id: int
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :return: list of question-answers
    :rtype: List[Dict]
    """

    # student questionAnswers
    r = await session.execute(select(Question.question, Answer.answer, QuestionTag.tag)
                              .select_from(QuestionAnswer)
                              .join(Question, QuestionAnswer.question)
                              .join(Answer, QuestionAnswer.answer)
                              .outerjoin(QuestionTag, Question.question_tags)
                              .where(QuestionAnswer.student_id == int(student_id)).order_by(QuestionAnswer.number))
    return [{"question": x[0], "answer": x[1]} for x in r.all() if x[2] is None]


@router.patch("/{student_id}",
              dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def update_student(student_id: int, student_update: StudentUpdate, session: AsyncSession = Depends(get_session)) -> dict:
    """update_student edits a student

    :param student_id: the id of the student
    :type student_id: int
    :param student_update: the data of the updated student
    :type student_update: StudentUpdate
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises StudentNotFoundException: raised when the student wasn't found
    :return: response message
    :rtype: dict
    """
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
async def delete_student(student_id: str, session: AsyncSession = Depends(get_session)) -> dict:
    """delete_student this deletes a student

    :param student_id: the id of the student
    :type student_id: str
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises StudentNotFoundException: raised when the student isn't found
    :return: response message
    :rtype: dict
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

    await websocketManager.broadcast({"deleted_student": config.api_url + "students/" + str(student_id), "student_int": student_id})

    return response(None, "Student deleted successfully")
