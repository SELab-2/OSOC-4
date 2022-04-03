from typing import List, Optional, Type, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, SQLModel

T = TypeVar("T", SQLModel, object)


async def read_all_where(model: T, *args, session: AsyncSession) -> List[T]:
    """read_all_where this function reads all the entries from a specific model,
    if a key and a value are passed this will be checked on each instance of model

    example read all Users:  read_all_where(User)
    example read all Users with Role admin: read_all_where(User, User.role, UserRole.ADMIN)

    :param model: the model to read all entries from
    :type model: SQLModel
    :param key: the key to check the value on, pass this argument as SQLModel.key (see the example)
    :param value: the value that the key should have
    :return: list with all data-entries of type model
    :rtype: List[SQLModel]
    """
    statement = select(model)
    for arg in args:
        statement = statement.where(arg)
    res = await session.execute(statement)
    return [value for (value,) in res.all()]


async def read_where(model: T, *args, session: AsyncSession) -> Optional[T]:
    """read_where this function reads one entry from a specific model that matches the given key and value

    example read user with id user_id:  read_where(User, User.id == user_id)

    :param model: the model to read all entries from
    :type model: SQLModel
    :param key: the key to check the value on, pass this argument as SQLModel.key (see the example)
    :param value: the value that the key should have
    :return: a data-entry of type model that has values as values for the keys, or None is no such data-entry could be found
    :rtype: Optional[SQLModel]
    """
    statement = select(model)
    for arg in args:
        statement = statement.where(arg)
    res = await session.execute(statement)
    first = res.first()
    if not first:
        return None
    return first[0]


async def count_where(model: Type[T], *args, session: AsyncSession) -> int:
    """count_where Count the objects where in mongodb

    :param model: _description_
    :type model: Type[SQLModel]
    :return: the object count
    :rtype: int
    """

    statement = select(model)
    for arg in args:
        statement = statement.where(arg)
    res = await session.execute(statement)
    if res is None:
        return 0
    return len(res.all())


async def update(model: T, session: AsyncSession) -> Optional[T]:
    """update this function updates one entry from a model (the one with the same id, or else it adds the id)

    example new_user is the updated version of the old user but the id remained:  update(new_user)

    :param model: an instance of the model to update / create
    :type model: SQLModel
    :return: the updated user upon succes
    :rtype: Optional[SQLModel]
    """

    session.add(model)
    await session.commit()
    await session.refresh(model)
    return model
