import os
from datetime import timedelta

from app.config import config
from app.crud import count_where, read_where, update
from app.database import db, get_session
from app.exceptions.user_exceptions import InvalidEmailOrPasswordException
from app.models.passwordreset import EmailInput
from app.models.tokens import TokenExtended
from app.models.user import User, UserLogin, UserRole
from app.utils.checkers import RoleChecker
from app.utils.cryptography import get_password_hash, verify_password
from app.utils.keygenerators import generate_new_reset_password_key
from app.utils.mailsender import send_password_reset
from app.utils.response import response
from dotenv import load_dotenv
from fastapi import APIRouter, Body, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
load_dotenv()


class Settings(BaseModel):
    authjwt_secret_key: str = 'e8ae5c5d5cd7f0f1bec2303ad04a7c80f09f759d480a7a5faff5a6bbaa4078d0'
    authjwt_denylist_enabled: bool = True
    authjwt_denylist_token_checks: set = {"access", "refresh"}
    access_expires: int = timedelta(minutes=int(os.getenv('ACCESS_EXPIRE', 15)))
    refresh_expires: int = timedelta(days=int(os.getenv("RESET_EXPIRE", 30)))
    authjwt_cookie_csrf_protect: bool = True
    authjwt_token_location: set = {"headers"}
    authjwt_cookie_samesite: str = 'lax'


settings = Settings()
router = APIRouter(prefix="")


@AuthJWT.load_config
def get_config() -> Settings:
    """get_config

    :return: settings for authentication
    :rtype: Settings
    """
    return Settings()


@AuthJWT.token_in_denylist_loader
def check_if_token_in_denylist(decrypted_token: str) -> bool:
    """check_if_token_in_denylist check if the token is revoked

    :param decrypted_token: token to check
    :type decrypted_token: string
    :return: true if valid
    :rtype: boolean
    """
    jti = decrypted_token['jti']
    entry = db.redis.get(jti)
    return entry and entry == 'true'


@router.get('/')
def root():
    paths = {"editions": f"{config.api_url}editions"}
    paths["users"] = f"{config.api_url}users"
    return paths


@router.post('/login')
async def login(user: UserLogin, Authorize: AuthJWT = Depends(), session: AsyncSession = Depends(get_session)):
    """login endpoint for login

    :param user: login info for user
    :type user: UserLogin
    :param Authorize: defaults to Depends()
    :type Authorize: AuthJWT, optional
    :raises HTTPException: if error occures
    :return: access and refresh token
    :rtype: dict
    """
    # check if any user exist else make one
    user_count = await count_where(User, session=session)
    if not user_count:
        new_user = User(
            email=user.email,
            name="Undefined",
            password=get_password_hash(user.password),
            role=UserRole.ADMIN,
            active=True,
            approved=True,
            disabled=False)
        u = await update(new_user, session)
    else:
        u = await read_where(User, User.email == user.email and not User.disabled, session=session)

    if u:
        if not verify_password(user.password, u.password):
            raise InvalidEmailOrPasswordException()

        access_token = Authorize.create_access_token(subject=u.id, expires_time=settings.access_expires)
        refresh_token = Authorize.create_refresh_token(subject=u.id, expires_time=settings.refresh_expires)

        # Authorize.set_access_cookies(access_token)
        # Authorize.set_refresh_cookies(refresh_token)

        # return response(UserOutSimple.parse_raw(u.json()), "Login successful")
        return response(
            TokenExtended(id=str(u.id), accessToken=access_token, accessTokenExpiry=int(os.getenv('ACCESS_EXPIRE', 15)),
                          refreshToken=refresh_token), "Login successful")

    raise InvalidEmailOrPasswordException()


@router.post('/refresh')
def refresh(Authorize: AuthJWT = Depends()):
    """refresh refresh the access token

    :param Authorize: defaults to Depends()
    :type Authorize: AuthJWT, optional
    :raises HTTPException: if error occures
    :return: new access token
    :rtype: dict
    """

    Authorize.jwt_refresh_token_required()

    current_user_id = Authorize.get_jwt_subject()
    new_access_token = Authorize.create_access_token(subject=current_user_id, expires_time=settings.access_expires)
    # Authorize.set_access_cookies(new_access_token)
    # return {"access_token": new_access_token}
    return TokenExtended(accessToken=new_access_token, id=current_user_id,
                         accessTokenExpiry=int(os.getenv('ACCESS_EXPIRE', 15)),
                         refreshToken=Authorize.get_raw_jwt()['jti'])


@router.delete('/access-revoke')
def access_revoke(Authorize: AuthJWT = Depends()):
    """access_revoke revoke the access token

    :param Authorize: defaults to Depends()
    :type Authorize: AuthJWT, optional
    :raises HTTPException: if error occures
    :return: success if access token revoked
    :rtype: dict
    """

    Authorize.jwt_required()

    jti = Authorize.get_raw_jwt()['jti']
    db.redis.setex(jti, settings.access_expires, 'true')
    return {"detail": "Access token has been revoked"}


@router.delete('/refresh-revoke')
def refresh_revoke(Authorize: AuthJWT = Depends()):
    """refresh_revoke revoke the refresh token

    :param Authorize: defaults to Depends()
    :type Authorize: AuthJWT, optional
    :raises HTTPException:  if error occures
    :return: success if refresh token revoked
    :rtype: dict
    """

    Authorize.jwt_refresh_token_required()

    jti = Authorize.get_raw_jwt()['jti']
    db.redis.setex(jti, settings.refresh_expires, 'true')
    return {"detail": "Refresh token has been revoked"}


@router.delete('/logout')
def logout(Authorize: AuthJWT = Depends()):
    """logout logout the user by deleting th cookies

    :param Authorize: defaults to Depends()
    :type Authorize: AuthJWT, optional
    :return: success if user logged out
    :rtype: dict
    """

    Authorize.jwt_required()
    Authorize.unset_jwt_cookies()
    return {"msg": "Successfully logout"}


@router.post('/forgot')
async def forgot(emailinput: EmailInput = Body(...), session: AsyncSession = Depends(get_session)):
    """forgot send an email with a reset password link if the user exists

    :param emailinput: email adress input, defaults to Body(...)
    :type emailinput: EmailInput, required
    :return: a messagae
    :rtype: dict
    """
    # check if user exists and not disabled
    user = await read_where(User, User.email == emailinput.email and not User.disabled, session=session)
    if user:
        reset_key, reset_expires = generate_new_reset_password_key()
        db.redis.setex(reset_key, reset_expires, str(user.id))
        # send email to user with the reset key
        send_password_reset(user.email, reset_key)

    return {
        "msg": "Check your inbox for a mail to reset your password. If you didn't receive an email the user with the entered email doesn't exist or is disabled"}
