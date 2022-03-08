from typing import List, Optional
from odmantic.bson import ObjectId
from app.database import engine
from app.models.partner import Partner


async def retrieve_partners() -> List[Partner]:
    """retrieve_partners

    :return: list of all partners in the database
    :rtype: List[Partner]
    """
    res = await engine.find(Partner)
    return res


async def add_partner(partner: Partner) -> Partner:
    """add_partner this adds a new partner to the database

    :param partner: the new partner to be added
    :type partner: Partner
    :return: returns the new user
    :rtype: User
    """
    partner = await engine.save(partner)
    return partner


async def get_partner_by_id(id: ObjectId) -> Optional[Partner]:
    """get_question_by_id this function returns the question with the given id

    :param id: the id of the partner
    :type id: ObjectId
    :return: The question with the given id or None if such a question doesn't exist
    :rtype: Optional[Question]
    """
    q = await engine.find_one(Partner, Partner.id == id)
    if q:
        return q
    return None

