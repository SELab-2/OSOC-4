from datetime import timedelta

from app.crud import read_by_key_value
from app.database import db
from app.models.user import User, UserLogin
from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel


class Settings(BaseModel):
    authjwt_secret_key: str = 'e8ae5c5d5cd7f0f1bec2303ad04a7c80f09f759d480a7a5faff5a6bbaa4078d0'
    authjwt_denylist_enabled: bool = True
    authjwt_denylist_token_checks: set = {"access", "refresh"}
    access_expires: int = timedelta(minutes=15)
    refresh_expires: int = timedelta(days=30)
    authjwt_cookie_csrf_protect: bool = True
    authjwt_token_location: set = {"headers", "cookies"}
    authjwt_cookie_secure: bool = False
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


@router.post('/login')
async def login(user: UserLogin, Authorize: AuthJWT = Depends()):
    """login endpoint for login

    :param user: login info for user
    :type user: UserLogin
    :param Authorize: defaults to Depends()
    :type Authorize: AuthJWT, optional
    :raises HTTPException: if error occures
    :return: access and refresh token
    :rtype: dict
    """
    u = await read_by_key_value(User, User.email, user.email)
    if u:
        access_token = Authorize.create_access_token(subject=str(u.id))
        refresh_token = Authorize.create_refresh_token(subject=str(u.id))

        Authorize.set_access_cookies(access_token)
        Authorize.set_refresh_cookies(refresh_token)

        return {"access_token": access_token, "refresh_token": refresh_token}

    raise HTTPException(status_code='401',
                        detail="Invalid email or password")


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
    new_access_token = Authorize.create_access_token(subject=current_user_id)
    Authorize.set_access_cookies(new_access_token)
    return {"access_token": new_access_token}


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
