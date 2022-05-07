from app.crud import read_where
from app.database import get_session, websocketManager
from app.models.sendemails import SendCustomEmail, SendEmails
from app.models.student import Student
from app.models.user import UserRole
from app.utils.checkers import EditionChecker, RoleChecker
from app.utils.mailsender import send_decision_template_email, send_email
from fastapi import APIRouter, Depends
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/sendemails")


@router.post("/decisions", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def send_decision_emails(data: SendEmails, Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)):

    user_id = Authorize.get_jwt_subject()

    for studenturl in data.emails:
        studentid = studenturl.split("/")[-1]

        student = await read_where(Student, Student.id == int(studentid), session=session)
        await EditionChecker(update=True)(student.edition_year, Authorize, session)

        await send_decision_template_email(student, user_id, session=session)
        await websocketManager.broadcast({"id": studenturl, "email_sent": True})


@router.post("/custom", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def send_custom_email(custom_email: SendCustomEmail, Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)):
    studentid = custom_email.student.split("/")[-1]
    student = await read_where(Student, Student.id == int(studentid), session=session)

    await EditionChecker(update=True)(student.edition_year, Authorize, session)

    user_id = Authorize.get_jwt_subject()

    await send_email(custom_email.subject, custom_email.email, student, user_id, session=session)
