from typing import Type, List, Optional
from odmantic.engine import ModelType

from app.database import db


async def read_all(model: Type[ModelType]) -> List[ModelType]:
    """read_all this function reads all the entries from a specific model

    example read all Users:  read_all(User)

    :param model: the model to read all entries from
    :type model: ModelType
    :return: list with all data-entries of type model
    :rtype: List[ModelType]
    """
    res = await db.engine.find(model)
    return res


async def read_by_key_value(model: Type[ModelType], key, value) -> Optional[ModelType]:
    """read_by_key_value this function reads one entry from a specific model that matches the given key and value

    example read user with id user_id:  read_by_key_value(User, User.id, user_id)

    :param model: the model to read all entries from
    :type model: ModelType
    :param key: the key to check the value on, pass this argument as ModelType.key (see the example)
    :param value: the value that the key should have
    :return: a data-entry of type model that has value as value for the key key, or None is no such data-entry could be found
    :rtype: Optional[ModelType]
    """
    res = await db.engine.find_one(model, key == value)
    return res if res else None


async def update(model: Type[ModelType]) -> Optional[ModelType]:
    """update this function updates one entry from a model (the one with the same id, or else it adds the id)

    example new_user is the updated version of the old user but the id remained:  update(new_user)

    :param model: an instance of the model to update / create
    :type model: ModelType
    :return: the updated user upon succes
    :rtype: Optional[ModelType]
    """
    model = await db.engine.save(model)
    return model
