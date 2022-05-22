""" This module includes the functions used to send emails to the students
"""

import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.crud import read_where, update
from app.models.answer import Answer
from app.models.emailtemplate import EmailTemplate, EmailTemplateName
from app.models.question_answer import QuestionAnswer
from app.models.question_tag import QuestionTag
from app.models.student import DecisionOption, Student
from app.models.user import User
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

load_dotenv()

SMTP_SERVER = os.getenv('SMTP_SERVER')
SMTP_SSL_PORT = os.getenv('SMTP_SSL_PORT')
SENDER_EMAIL = os.getenv('SENDER_EMAIL')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD')
FRONTEND_URL = os.getenv('FRONTEND_URL')


def send_password_reset(email: str, resetkey: str):
    """send_password_reset this function sends an email to reset the user password

    :param email: the email of the user
    :type email: str
    :param resetkey: the reset key
    :type resetkey: str
    """
    receiver_email = email  # Enter receiver address

    subject = "Forgot Password"
    body = f"Use this link to reset the password of your account {FRONTEND_URL}/resetpassword/{resetkey}"

    message = MIMEMultipart()
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "plain"))
    text = message.as_string()

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_SSL_PORT, context=context) as server:
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, text)


def send_change_email_email(email: str, changekey: str):
    """send_change_email_email this funcion sends an email to change a user email

    :param email: the email of the user
    :type email: str
    :param changekey: the change key
    :type changekey: str
    """

    receiver_email = email  # Enter receiver address

    subject = "Change email"
    body = f"Use this link to change the email of your account {FRONTEND_URL}/change/{changekey}"

    message = MIMEMultipart()
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "plain"))
    text = message.as_string()

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_SSL_PORT, context=context) as server:
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, text)


def send_invite(email: str, invitekey: str):
    """send_invite this functions sends an invite email

    :param email: email of the receiver
    :type email: str
    :param invitekey: the invitekey used to identify the user
    :type invitekey: str
    """
    receiver_email = email  # Enter receiver address

    subject = "Activate OSOC Account"
    body = f"Use this link to activate your account {FRONTEND_URL}/invites/{invitekey}"

    message = MIMEMultipart()
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "plain"))
    text = message.as_string()

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_SSL_PORT, context=context) as server:
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, text)


async def send_decision_template_email(student: Student, userid: str, session: AsyncSession):
    """send_decision_template_email sends an email to the student with the decision template

    :param student: student object
    :type student: Student
    :param userid: the userid of the user that sends the email
    :type userid: str
    :param session: session used to perform database operations
    :type session: AsyncSession
    """

    # get the decision template
    if student.decision == DecisionOption.YES:
        template = await read_where(EmailTemplate, EmailTemplate.name == EmailTemplateName.YES_DECISION, session=session)
    elif student.decision == DecisionOption.MAYBE:
        template = await read_where(EmailTemplate, EmailTemplate.name == EmailTemplateName.MAYBE_DECISION, session=session)
    elif student.decision == DecisionOption.NO:
        template = await read_where(EmailTemplate, EmailTemplate.name == EmailTemplateName.NO_DECISION, session=session)
    elif student.decision == DecisionOption.UNDECIDED:
        template = await read_where(EmailTemplate, EmailTemplate.name == EmailTemplateName.UNDECIDED, session=session)

    if not template:
        template_body = ""
        template_subject = ""
    else:
        template_body = template.template
        template_subject = template.subject

    await send_email(template_subject, template_body, student, userid, session=session)


async def send_email(subject: str, email_body: str, student: Student, userid: str, session: AsyncSession):
    """send_email sends an email to student with subject and body

    :param subject: the subject for the email
    :type subject: str
    :param email_body: the email body
    :type email_body: str
    :param student: the Student receiver
    :type student: Student
    :param userid: the userid of the user that sends the email
    :type userid: str
    :param session: the session used to perform database operations
    :type session: AsyncSession
    """
    r = await session.execute(select(QuestionTag.tag, Answer.answer)
                              .where(QuestionTag.tag.in_(["first name", "last name", "email"]))
                              .select_from(Student)
                              .where(Student.id == int(student.id))
                              .join(QuestionAnswer)
                              .join(QuestionTag, QuestionAnswer.question_id == QuestionTag.question_id)
                              .join(Answer))
    student_info = r.all()

    user = await read_where(User, User.id == int(userid), session=session)

    for (k, v) in student_info:
        if k == "first name":
            firstname = v
        elif k == "last name":
            lastname = v
        elif k == "email":
            email = v

    # format student info in template
    formatted_template = email_body.replace("@firstname", firstname)
    formatted_template = formatted_template.replace("@lastname", lastname)
    formatted_template = formatted_template.replace("@username", user.name)

    receiver_email = email  # Enter receiver address

    message = MIMEMultipart()
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(formatted_template, "plain"))
    text = message.as_string()

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_SSL_PORT, context=context) as server:
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, text)

    student.email_sent = True
    await update(student, session=session)
