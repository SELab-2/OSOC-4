from fastapi import APIRouter
from app.utils.response import response, errorresponse
from app.utils.tallyhandler import process_tally
from app.crud.student_forms import get_all_studentforms, get_studentform_with_id
from app.models.student_form import StudentFormOut

router = APIRouter(prefix="/studentforms")


@router.get("/")
async def get_all_form_ids():
    forms = await get_all_studentforms()
    return response([str(form.id) for form in forms], "Fetched all forms successfully")


@router.get("/{id}")
async def get_form_with_id(id):
    form = await get_studentform_with_id(id)
    return response(form, "Fetched one form")


@router.get("/simple")
async def get_forms_basic():
    forms = []
    ffen = await get_all_studentforms()
    for form in ffen:
        forms.append(StudentFormOut.parse_raw(form.json()))
    return response(forms, "Fetched all forms successfully")


@router.post("/add", response_description="Form submitted")
async def add_new_form(data: dict):
    await process_tally(data)
    return response(None, "Form added successfully.")
