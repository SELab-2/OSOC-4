""" This module includes the configs for the app """

import os

from dotenv import load_dotenv
from pydantic import BaseSettings

load_dotenv()


def get_api_path():
    """get_api_path

    :return: api path
    :rtype: str
    """
    PATHPREFIX = os.getenv("PATHPREFIX", "")
    API_BASE = (PATHPREFIX + "/" if PATHPREFIX else "/")
    return API_BASE


def get_api_url():
    """get_api_url

    :return: api_url
    :rtype: str
    """
    return os.getenv('DOMAIN', "http://localhost:8000")


class Settings(BaseSettings):
    """Settings with api_path and api_url"""
    api_path: str = get_api_path()
    api_url: str = get_api_url() + get_api_path()


config = Settings()
