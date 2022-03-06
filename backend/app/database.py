import motor.motor_asyncio
from bson.objectid import ObjectId
import os

MONGO_URL = os.environ.get('MONGO_URL')
MONGO_PORT = os.environ.get('MONGO_PORT')
MONGO_USER = os.environ.get('MONGO_USER')
MONGO_PASSWORD = os.environ.get('MONGO_PASSWORD')

MONGO_DETAILS = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_URL}:{MONGO_PORT}"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

database = client.selab

user_collection = database.get_collection("user_collection")
