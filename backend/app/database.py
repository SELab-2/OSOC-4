from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine

MONGO_DETAILS = "mongodb://root:justapassword@192.168.53.41:27017"

client = AsyncIOMotorClient(MONGO_DETAILS)

engine = AIOEngine(motor_client=client, database="selab")
