from app.database import get_session, websocketManager
from app.models.sendemails import SendEmails
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from app.utils.mailsender import send_decision_email
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/sendemails")


@router.post("/decisions", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def send_decision_emails(data: SendEmails, session: AsyncSession = Depends(get_session)):
    for studenturl in data.emails:
        studentid = studenturl.split("/")[-1]
        await send_decision_email(studentid, session=session)
        await websocketManager.broadcast({"id": studenturl, "email_sent": True})
