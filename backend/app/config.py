import os

from pydantic import BaseSettings


def get_api_path():
    PATHPREFIX = os.getenv("PATHPREFIX", "")
    API_BASE = (PATHPREFIX + "/api/" if PATHPREFIX else "/")
    return API_BASE


def get_api_url():
    return "http://192.168.0.102:8000"


class Settings(BaseSettings):
    api_path: str = get_api_path()
    api_url: str = get_api_url() + get_api_path()


config = Settings()
