from app.crud import read_where
from app.database import get_session
from app.exceptions.suggestion_exception import SuggestionNotFound
from app.models.suggestion import (Suggestion, SuggestionCreate,
                                   SuggestionExtended)
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/suggestions")


@router.post("/create", response_description="Suggestion created")
async def create_suggestion(suggestion: SuggestionCreate, session: AsyncSession = Depends(get_session)):
    pass


@router.get("/{id}", response_description="Suggestion with id retrieved")
async def get_suggestion_with_id(id: int, session: AsyncSession = Depends(get_session)):
    suggestion = await read_where(Suggestion, Suggestion.id == id, session=session)

    if suggestion is None:
        raise SuggestionNotFound()

    return SuggestionExtended.parse_raw(suggestion.json())
