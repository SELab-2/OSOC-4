""" This module includes the Token model
"""

from app.config import config
from pydantic import BaseModel


class TokenExtended(BaseModel):
    """an output model for the tokens (accessToken + refreshToken)
    """
    id: str
    accessToken: str
    accessTokenExpiry: int
    refreshToken: str

    def __init__(self, **data):
        """the constructor
            the kwargs in "data" are used to initialize the attributes of this class
        """
        data["id"] = config.api_url + "users/" + str(data["id"])
        super().__init__(**data)
