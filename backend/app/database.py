import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine
from redis import Redis
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL')
MONGO_PORT = os.getenv('MONGO_PORT')
MONGO_USER = os.getenv('MONGO_USER')
MONGO_PASSWORD = os.getenv('MONGO_PASSWORD')

REDIS_URL = os.getenv('REDIS_URL')
REDIS_PORT = os.getenv('REDIS_PORT')
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')

MONGO_DETAILS = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_URL}:{MONGO_PORT}"

DATABASE_URL = f"postgresql+asyncpg://postgres:justapassword@192.168.0.102:5432/OSOC"
engine = create_async_engine(DATABASE_URL, echo=True)


async def init_db():
    db.redis = Redis(host=REDIS_URL, port=REDIS_PORT, db=0, decode_responses=True, password=REDIS_PASSWORD)
    async with engine.begin() as conn:
        # await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)


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
