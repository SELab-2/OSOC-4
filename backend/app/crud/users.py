from ..database import user_collection
from ..utils.cryptography import get_password

def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"]
    }

async def retrieve_users():
    users = []
    async for user in user_collection.find():
        users.append(user_helper(user))

    return users

async def add_user(user_data: dict) -> dict:
    user_data['password'] = get_password(user_data['password'])
    user = await user_collection.insert_one(user_data)
    new_user = await user_collection.find_one({"_id": user.inserted_id})
    return user_helper(new_user)