""" This module includes the functions used generate the different keys
"""

import os
import random
import string
from datetime import timedelta
from typing import Tuple

from app.database import db
from dotenv import load_dotenv

load_dotenv()
INVITE_EXPIRE = os.getenv('INVITE_EXPIRE')
PASSWORDRESET_EXPIRE = os.getenv('PASSWORDRESET_EXPIRE')


def generate_random_key(length: int) -> str:
    """generate_random_key generate random string of x chars

    :param length: the length of the string
    :type length: int
    :return: the random string
    :rtype: str
    """
    chars = string.ascii_lowercase + string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))


def generate_new_invite_key() -> Tuple[str, int]:
    """generate_new_invite_key generate invite key

    :return: invite key and invite expire
    :rtype: Tuple[str, int]
    """
    invite_expires: int = timedelta(minutes=int(INVITE_EXPIRE))

    invite_key = "I" + generate_random_key(20)
    # make sure the invite key is unique
    while db.redis.get(invite_key):
        invite_key = "I" + generate_random_key(20)

    return invite_key, invite_expires


def generate_new_reset_password_key() -> Tuple[str, int]:
    """generate_new_reset_password_key generate reset key

    :return: reset key and reset expire
    :rtype: Tuple[str, int]
    """
    reset_password_expires: int = timedelta(minutes=int(PASSWORDRESET_EXPIRE))

    invite_key = "R" + generate_random_key(20)
    # make sure the invite key is unique
    while db.redis.get(invite_key):
        invite_key = "R" + generate_random_key(20)

    return invite_key, reset_password_expires
