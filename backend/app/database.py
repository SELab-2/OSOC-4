""" This module includes the function for the database connection """

import os
import time

from dotenv import load_dotenv
from redis import Redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from app.utils.websocketmanager import WebSocketManager

load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')
POSTGRES_PORT = os.getenv('POSTGRES_PORT')
POSTGRES_USER = os.getenv('POSTGRES_USER')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
POSTGRES_DATABASE = os.getenv('POSTGRES_DATABASE')

REDIS_URL = os.getenv('REDIS_URL')
REDIS_PORT = os.getenv('REDIS_PORT')
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')

DATABASE_URL = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_URL}:{POSTGRES_PORT}/{POSTGRES_DATABASE}"
engine = create_async_engine(DATABASE_URL)


async def init_db():
    """init_db init the database connection
    """
    db.redis = Redis(host=REDIS_URL, port=REDIS_PORT, db=0, decode_responses=True, password=REDIS_PASSWORD)

    connection = False
    for _ in range(15):
        try:
            async with engine.begin() as conn:
                # await conn.run_sync(SQLModel.metadata.drop_all)
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm;"))
                await conn.run_sync(SQLModel.metadata.create_all)
                connection = True
                break
        except Exception as e:
            print("Something went wrong while trying to connect.")
            print(e)
            print("Retrying to connect ...")
            time.sleep(1)
    if not connection:
        exit(1)


async def get_session() -> AsyncSession:
    """get_session return a new session

    :return: a new session
    :rtype: AsyncSession
    :yield: a new session
    :rtype: Iterator[AsyncSession]
    """
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session


class Database:
    """ object with redis connection
    """
    redis: Redis = None


db = Database()
websocketManager = WebSocketManager()


async def disconnect_db():
    """disconnect_db disconnect the database
    """
    await engine.dispose()
    db.redis.close()
