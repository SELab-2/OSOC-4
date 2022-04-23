from app.crud import read_where, update
from app.database import get_session
from app.models.student import Student
from app.models.participation import Participation, ParticipationCreate
from app.models.user import UserRole
from app.utils.checkers import EditionChecker, RoleChecker
from fastapi import APIRouter, Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/participations")


@router.post("/create", dependencies=[Depends(RoleChecker(UserRole.COACH))], response_description="Participation created")
async def create_participation(participation: ParticipationCreate, session: AsyncSession = Depends(get_session), Authorize: AuthJWT = Depends()):

    # check edition
    student = await read_where(Student, Student.id == participation.student_id, session=session)
    await EditionChecker(update=True)(student.edition_year, Authorize, session)

    # check if participation already exists
    old_participation = await read_where(Participation, Participation.project_id == participation.project_id, Participation.student_id == participation.student_id, session=session)

    if old_participation:
        new_participation_data = participation.dict(exclude_unset=True)
        for key, value in new_participation_data.items():
            setattr(old_participation, key, value)
    else:
        old_participation = Participation.parse_raw(participation.json())

    await update(old_participation, session)
