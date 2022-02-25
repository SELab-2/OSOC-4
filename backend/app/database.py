import motor.motor_asyncio
from bson.objectid import ObjectId

MONGO_DETAILS = "mongodb://root:justapassword@192.168.0.102:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

database = client.selab

user_collection = database.get_collection("user_collection")