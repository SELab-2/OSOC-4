from app.crud import read_all_where, read_where
from app.database import get_session
from app.exceptions.suggestion_exception import SuggestionNotFound
from app.models.suggestion import Suggestion, SuggestionExtended
from app.utils.response import list_modeltype_response
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/suggestions")


@router.get("/", response_description="Suggestions retrieved")
async def get_suggestions():
    """get_suggestions get all the Suggestion instances from the database

    :return: list of suggestions
    :rtype: dict
    """
    results = await read_all_where(Suggestion)
    return list_modeltype_response(results, Suggestion)


@router.get("/{id}", response_description="Suggestion with id retrieved")
async def get_suggestion_with_id(id: int, session: AsyncSession = Depends(get_session)):
    suggestion = await read_where(Suggestion, Suggestion.id == id, session=session)

    if suggestion is None:
        raise SuggestionNotFound()

    return SuggestionExtended.parse_raw(suggestion.json())
