""" This module includes all the participation endpoints """

from app.config import config
from app.crud import read_where, update
from app.database import get_session, websocketManager
from app.exceptions.participation_exceptions import (
    InvalidParticipationException, ParticipationNotFoundException)
from app.models.participation import (Participation, ParticipationCreate,
                                      ParticipationOutProject)
from app.models.project import Project
from app.models.student import Student
from app.models.user import UserRole
from app.utils.checkers import EditionChecker, RoleChecker
from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/participations")


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Participation created")
async def create_participation(participation: ParticipationCreate,
                               session: AsyncSession = Depends(get_session),
                               Authorize: AuthJWT = Depends()) -> str:
    """create_participation add a new participation

    :param participation: the participation data
    :type participation: ParticipationCreate
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :param Authorize: needed to know who requested this, defaults to Depends()
    :type Authorize: AuthJWT, optional
    :raises InvalidParticipationException: raised when the participation is not possible
    :return: the url to the student of the participation
    :rtype: str
    """

    # check if student and project exists
    student = await read_where(Student, Student.id == participation.student_id, session=session)
    if not student:
        raise InvalidParticipationException()

    project = await read_where(Project, Project.id == participation.project_id, session=session)
    if not project:
        raise InvalidParticipationException()

    # check if editions match
    if student.edition_year != project.edition:
        raise InvalidParticipationException()

    # check edition
    await EditionChecker(update=True)(student.edition_year, Authorize, session)

    # check if participation already exists
    old_participation = await read_where(Participation, Participation.project_id == participation.project_id,
                                         Participation.student_id == participation.student_id, session=session)

    if old_participation:
        new_participation_data = participation.dict(exclude_unset=True)
        for key, value in new_participation_data.items():
            setattr(old_participation, key, value)
    else:
        old_participation = Participation.parse_raw(participation.json())

    await update(old_participation, session)

    await websocketManager.broadcast({"projectId": project.id, "studentId": student.id, "participation": jsonable_encoder(ParticipationOutProject.parse_raw(old_participation.json()))})

    return f"{config.api_url}students/{old_participation.student_id}"


@router.delete("", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Participation deleted")
async def delete_participation(student_id: str,
                               project_id: str,
                               session: AsyncSession = Depends(get_session),
                               Authorize: AuthJWT = Depends()) -> None:
    """delete_participations remove a participation

    :param student_id: the student id of the participation
    :type student_id: str
    :param project_id: the project id of the participation
    :type project_id: str
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :param Authorize: needed to know who requested this, defaults to Depends()
    :type Authorize: AuthJWT, optional
    :raises ParticipationNotFoundException: raised when the participation isn't found
    """

    # check if participation exists
    participation = await read_where(Participation, Participation.project_id == int(project_id), Participation.student_id == int(student_id), session=session)

    if not participation:
        raise ParticipationNotFoundException()

    # check edition
    student = await read_where(Student, Student.id == int(student_id), session=session)
    if not student:
        raise ParticipationNotFoundException()
    await EditionChecker(update=True)(student.edition_year, Authorize, session)

    await session.delete(participation)
    await session.commit()
    await websocketManager.broadcast({"projectId": project_id, "studentId": student_id, "deleted_participation": True})


@router.patch("", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Participation edited")
async def edit_participation(student_id: int,
                             project_id: int,
                             new_participation: ParticipationCreate,
                             session: AsyncSession = Depends(get_session),
                             Authorize: AuthJWT = Depends()) -> str:
    """edit_participation edit a participation

    :param student_id:  the student id of the participation
    :type student_id: int
    :param project_id: the project id of the participation
    :type project_id: int
    :param new_participation: the participation data
    :type new_participation: ParticipationCreate
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :param Authorize: needed to know who requested this, defaults to Depends()
    :type Authorize: AuthJWT, optional
    :raises ParticipationNotFoundException: raised when the participation isn't found
    :raises InvalidParticipationException: raised when the participation isn't valid
    :return: the url of the student from the participation
    :rtype: str
    """

    # check if participation exists
    old_participation = await read_where(Participation, Participation.project_id == project_id, Participation.student_id == student_id, session=session)

    if not old_participation:
        raise ParticipationNotFoundException()

    # check if student and project exists
    student = await read_where(Student, Student.id == new_participation.student_id, session=session)
    if not student:
        raise InvalidParticipationException()

    project = await read_where(Project, Project.id == new_participation.project_id, session=session)
    if not project:
        raise InvalidParticipationException()

    # check if editions match
    if student.edition_year != project.edition:
        raise InvalidParticipationException()

    # check edition
    await EditionChecker(update=True)(student.edition_year, Authorize, session)

    # update participation
    new_participation_data = new_participation.dict(exclude_unset=True)
    for key, value in new_participation_data.items():
        setattr(old_participation, key, value)

    await update(old_participation, session)

    await websocketManager.broadcast({"projectId": project.id, "studentId": student.id, "participation": jsonable_encoder(ParticipationOutProject.parse_raw(old_participation.json()))})

    return f"{config.api_url}students/{old_participation.student_id}"
