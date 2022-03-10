import os
import random
import string
from datetime import timedelta
from typing import Tuple

from app.database import db
from dotenv import load_dotenv


def generate_new_invite_key(suffix: str) -> Tuple[str, int]:
    load_dotenv()
    INVITE_EXPIRE = os.getenv('INVITE_EXPIRE')
    invite_expires: int = timedelta(minutes=int(INVITE_EXPIRE))

    def random_string(size, chars=string.ascii_uppercase + string.digits):
        return ''.join(random.choice(chars) for _ in range(size))

    invite_key = random_string(20) + "_" + str(suffix)
    # make sure the invite key is unique
    while db.redis.get(invite_key):
        invite_key = random_string(20) + "_" + str(suffix)

    return invite_key, invite_expires
