from app.crud import read_where, update
from app.database import get_session
from app.exceptions.emailtemplate_exceptions import \
    EmailTemplateNotFoundException
from app.models.emailtemplate import (EmailTemplate, EmailTemplateName,
                                      EmailTemplatePatch)
from app.models.user import UserRole
from app.utils.checkers import RoleChecker
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/emailtemplates")


@router.get("/{name}", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def get_email_template(name: str, session: AsyncSession = Depends(get_session)):

    if name not in EmailTemplateName.__members__:
        raise EmailTemplateNotFoundException()

    name = EmailTemplateName[name]
    # get the template with name
    template = await read_where(EmailTemplate, EmailTemplate.name == name, session=session)
    if not template:
        template = await update(EmailTemplate(name=name), session=session)

    return template


@router.patch("/{name}")
async def update_email_template(name: str, newtemplate: EmailTemplatePatch, session: AsyncSession = Depends(get_session)):
    # check if valid template name

    if name not in EmailTemplateName.__members__:
        raise EmailTemplateNotFoundException()

    name = EmailTemplateName[name]

    # get the template with name
    template = await read_where(EmailTemplate, EmailTemplate.name == name, session=session)
    if not template:
        template = EmailTemplate(name=name)
    template.template = newtemplate.template

    await update(template, session=session)
