from typing import List, Optional, Type

from odmantic.engine import ModelType

from app.database import db


async def read_all_where(model: Type[ModelType], sort=None, *args) -> List[ModelType]:
    """read_all_where this function reads all the entries from a specific model,
    if a key and a value are passed this will be checked on each instance of model

    example read all Users:  read_all_where(User)
    example read all Users with Role admin: read_all_where(User, User.role, UserRole.ADMIN)

    :param model: the model to read all entries from
    :type model: ModelType
    :param key: the key to check the value on, pass this argument as ModelType.key (see the example)
    :param value: the value that the key should have
    :return: list with all data-entries of type model
    :rtype: List[ModelType]
    """
    if sort:
        res = await db.engine.find(model, *args, sort=sort)
    else:
        res = await db.engine.find(model, *args)
    return res


async def read_where(model: Type[ModelType], *args) -> Optional[ModelType]:
    """read_where this function reads one entry from a specific model that matches the given key and value

    example read user with id user_id:  read_where(User, User.id == user_id)

    :param model: the model to read all entries from
    :type model: ModelType
    :param key: the key to check the value on, pass this argument as ModelType.key (see the example)
    :param value: the value that the key should have
    :return: a data-entry of type model that has values as values for the keys, or None is no such data-entry could be found
    :rtype: Optional[ModelType]
    """
    res = await db.engine.find_one(model, *args)
    return res if res else None


async def count_where(model: Type[ModelType], *args) -> int:
    """count_where Count the objects where in mongodb

    :param model: _description_
    :type model: Type[ModelType]
    :return: the object count
    :rtype: int
    """
    res = await db.engine.count(model, *args)
    return res


async def update(model: ModelType) -> Optional[ModelType]:
    """update this function updates one entry from a model (the one with the same id, or else it adds the id)

    example new_user is the updated version of the old user but the id remained:  update(new_user)

    :param model: an instance of the model to update / create
    :type model: ModelType
    :return: the updated user upon succes
    :rtype: Optional[ModelType]
    """
    model = await db.engine.save(model)
    return model
