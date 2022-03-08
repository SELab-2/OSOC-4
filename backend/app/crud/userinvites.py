import os
import random
import string
from datetime import timedelta

from app.database import db
from app.models.user import User
from dotenv import load_dotenv

load_dotenv()

INVITE_EXPIRE = os.getenv('INVITE_EXPIRE')

invite_expires: int = timedelta(minutes=int(INVITE_EXPIRE))


def create_invite(user: User) -> str:
    """create_invite this creates an invitekey and saves it in the redis server

    :param user: the user object for which an invite must be created
    :type user: User
    :return: the invite key
    :rtype: str
    """
    def random_string(size=6, chars=string.ascii_uppercase + string.digits):
        return ''.join(random.choice(chars) for _ in range(size))

    if user.active:
        return None
    invitekey = random_string(20) + "_" + str(user.id)
    while invite_exists(invitekey):
        invitekey = random_string(20) + "_" + str(user.id)

    try:
        db.redis.setex(invitekey, invite_expires, "true")
    except:
        return None
    return invitekey


def invite_exists(invitekey: str) -> str:
    """invite_exists check if the invitekey is in the redis server

    :param invitekey: the invite key
    :type invitekey: str
    :return: None if the key is invalid
    :rtype: str or None
    """
    return db.redis.get(invitekey)


def delete_invite(invitekey: str):
    """delete_invite this deletes the invitekey from the redis server

    :param invitekey: the invitekey
    :type invitekey: str
    """
    if invite_exists(invitekey):
        db.redis.delete(invitekey)
