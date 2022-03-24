from app.config import config
from pydantic import BaseModel


class TokenExtended(BaseModel):
    id: str
    accessToken: str
    accessTokenExpiry: int
    refreshToken: str

    def __init__(self, **data):
        data["id"] = config.api_url + "users/" + data["id"]
        super().__init__(**data)
