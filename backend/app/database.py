from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine
import os
from dotenv import load_dotenv
from redis import Redis

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL')
MONGO_PORT = os.getenv('MONGO_PORT')
MONGO_USER = os.getenv('MONGO_USER')
MONGO_PASSWORD = os.getenv('MONGO_PASSWORD')

MONGO_DETAILS = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_URL}:{MONGO_PORT}"

client = AsyncIOMotorClient(MONGO_DETAILS)

engine = AIOEngine(motor_client=client, database="selab")


REDIS_URL = os.getenv('REDIS_URL')
REDIS_PORT = os.getenv('REDIS_PORT')
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')

redis = Redis(host=REDIS_URL, port=REDIS_PORT, db=0,
              decode_responses=True, password=REDIS_PASSWORD)
