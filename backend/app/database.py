from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine
import os

MONGO_URL = os.environ.get('MONGO_URL')
MONGO_PORT = os.environ.get('MONGO_PORT')
MONGO_USER = os.environ.get('MONGO_USER')
MONGO_PASSWORD = os.environ.get('MONGO_PASSWORD')

MONGO_DETAILS = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_URL}:{MONGO_PORT}"

client = AsyncIOMotorClient(MONGO_DETAILS)

engine = AIOEngine(motor_client=client, database="selab")
