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
async def get_email_template(name: str, session: AsyncSession = Depends(get_session)) -> dict:
    """get_email_template

    :param name: the name of the template
    :type name: str
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises EmailTemplateNotFoundException: raised when no template with that name is found
    :return: the template
    :rtype: dict
    """

    if name not in EmailTemplateName.__members__:
        raise EmailTemplateNotFoundException()

    name = EmailTemplateName[name]
    # get the template with name
    template = await read_where(EmailTemplate, EmailTemplate.name == name, session=session)
    if not template:
        template = await update(EmailTemplate(name=name), session=session)

    return template


@router.patch("/{name}", dependencies=[Depends(RoleChecker(UserRole.ADMIN))])
async def update_email_template(name: str, newtemplate: EmailTemplatePatch, session: AsyncSession = Depends(get_session)) -> None:
    """update_email_template

    :param name: the name of the email template
    :type name: str
    :param newtemplate: the data to update the template with
    :type newtemplate: EmailTemplatePatch
    :param session: the session object, defaults to Depends(get_session)
    :type session: AsyncSession, optional
    :raises EmailTemplateNotFoundException: raised when the template isn't found
    """
    # check if valid template name

    if name not in EmailTemplateName.__members__:
        raise EmailTemplateNotFoundException()

    name = EmailTemplateName[name]

    # get the template with name
    template = await read_where(EmailTemplate, EmailTemplate.name == name, session=session)
    if not template:
        template = EmailTemplate(name=name)
    template.template = newtemplate.template
    template.subject = newtemplate.subject

    await update(template, session=session)
