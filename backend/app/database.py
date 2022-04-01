import os
import time

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine
from redis import Redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

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
print(DATABASE_URL)
engine = create_async_engine(DATABASE_URL)

async def init_db():
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
            print("trying to connect ...")
            print(e)
            time.sleep(1)
    if not connection:
        exit(1)

async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session


class Database:
    redis: Redis = None


db = Database()


# def connect_db():
#     db.client = AsyncIOMotorClient(MONGO_DETAILS)
#     db.engine = AIOEngine(motor_client=db.client, database="selab")
#     


# def disconnect_db():
#     db.client.close()
#     db.redis.close()
