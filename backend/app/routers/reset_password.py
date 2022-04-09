from fastapi import APIRouter, Depends, Body

from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import read_where, update
from app.database import db, get_session
from app.exceptions.key_exceptions import InvalidResetKeyException
from app.exceptions.permissions import NotPermittedException
from app.exceptions.user_exceptions import UserAlreadyActiveException, PasswordsDoNotMatchException
from app.models.user import User, UserResetPassword
from app.utils.cryptography import get_password_hash
from app.utils.response import response

router = APIRouter(prefix="/resetpassword")


@router.get("/{resetkey}")
async def valid_resetkey(resetkey: str):
    if resetkey[0] != "R":
        raise InvalidResetKeyException()
    userid = db.redis.get(resetkey)
    if userid is None:
        raise InvalidResetKeyException()
    return response(None, "Valid resetkey")


@router.post("/{resetkey}")
async def use_resetkey(resetkey: str, reset: UserResetPassword = Body(...), session: AsyncSession = Depends(get_session)):
    if resetkey[0] != "R":
        raise InvalidResetKeyException()

    userid = db.redis.get(resetkey)  # check that the inv key exists

    if userid:
        user = await read_where(User, User.id == int(userid), session=session)

        if not user:
            raise NotPermittedException()

        if not user.active:
            raise NotPermittedException()

        if reset.password != reset.validate_password:
            raise PasswordsDoNotMatchException()

        user.password = get_password_hash(reset.password)

        await update(user, session=session)
        db.redis.delete(resetkey)

        return response(None, "Password reset successful")

    raise InvalidResetKeyException()
