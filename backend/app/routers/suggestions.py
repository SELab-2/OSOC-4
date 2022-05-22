""" This module includes the suggestion endpoints """

from app.crud import read_where, update
from app.database import get_session, websocketManager
from app.exceptions.suggestion_exception import SuggestionNotFound
from app.models.student import Student
from app.models.suggestion import (Suggestion, SuggestionCreate,
                                   SuggestionExtended)
from app.models.user import UserRole
from app.utils.checkers import EditionChecker, RoleChecker
from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/suggestions")


@router.post("/create", response_description="Suggestion created")
async def create_suggestion(suggestion: SuggestionCreate, role: RoleChecker(UserRole.COACH) = Depends(), session: AsyncSession = Depends(get_session), Authorize: AuthJWT = Depends()) -> None:
    """create_suggestion creates a new suggestion

    :param suggestion: the suggestion data
    :type suggestion: SuggestionCreate
    :param role: the role of the user making the suggestion, defaults to Depends()
    :type role: RoleChecker, optional
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :param Authorize: needed to know who made the suggestion, defaults to Depends()
    :type Authorize: AuthJWT, optional
    """

    # check edition
    student = await read_where(Student, Student.id == suggestion.student_id, session=session)
    await EditionChecker(update=True)(student.edition_year, Authorize, session)

    old_suggestion = await read_where(Suggestion, Suggestion.suggested_by_id == Authorize.get_jwt_subject(), Suggestion.student_id == suggestion.student_id, session=session)

    if not old_suggestion:
        old_suggestion = Suggestion.parse_raw(suggestion.json())
        old_suggestion.suggested_by_id = Authorize.get_jwt_subject()

    new_suggestion_data = suggestion.dict(exclude_unset=True)
    for key, value in new_suggestion_data.items():
        setattr(old_suggestion, key, value)
    await update(old_suggestion, session)

    await websocketManager.broadcast({"id": old_suggestion.id, "suggestion": jsonable_encoder(SuggestionExtended.parse_raw(old_suggestion.json()))})


@router.get("/{id}", dependencies=[Depends(EditionChecker())], response_description="Suggestion with id retrieved")
async def get_suggestion_with_id(id: int, session: AsyncSession = Depends(get_session)) -> dict:
    """get_suggestion_with_id gets a suggestion based on its id

    :param id: the id of the suggestion
    :type id: int
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises SuggestionNotFound: raised when the suggestion was not found
    :return: SuggestionOutExtended
    :rtype: dict
    """
    suggestion = await read_where(Suggestion, Suggestion.id == id, session=session)

    if suggestion is None:
        raise SuggestionNotFound()

    return SuggestionExtended.parse_raw(suggestion.json())
