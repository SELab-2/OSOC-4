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
from dotenv import load_dotenv
from sqlmodel import select

load_dotenv()

SMTP_SERVER = os.getenv('SMTP_SERVER')
SMTP_SSL_PORT = os.getenv('SMTP_SSL_PORT')
SENDER_EMAIL = os.getenv('SENDER_EMAIL')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD')
FRONTEND_URL = os.getenv('FRONTEND_URL')


def send_password_reset(email: str, resetkey: str):
    """send_password_reset this function sents an email to reset the user password

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


def send_invite(email: str, invitekey: str):
    """send_invite this functions sents an invite email

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


async def send_decision_email(studentid, session):

    student = await read_where(Student, Student.id == int(studentid), session=session)

    r = await session.execute(select(QuestionTag.tag, Answer.answer).where(QuestionTag.tag.in_(["first name", "last name", "email"])).select_from(Student).where(Student.id == int(studentid)).join(QuestionAnswer).join(QuestionTag, QuestionAnswer.question_id == QuestionTag.question_id).join(Answer))
    student_info = r.all()

    for (k, v) in student_info:
        if k == "first name":
            firstname = v
        elif k == "last name":
            lastname = v
        elif k == "email":
            email = v

    # get the decision template
    if student.decision == DecisionOption.YES:
        template = await read_where(EmailTemplate, EmailTemplate.name == EmailTemplateName.YES_DECISION, session=session)
    elif student.decision == DecisionOption.MAYBE:
        template = await read_where(EmailTemplate, EmailTemplate.name == EmailTemplateName.MAYBE_DECISION, session=session)
    elif student.decision == DecisionOption.NO:
        template = await read_where(EmailTemplate, EmailTemplate.name == EmailTemplateName.NO_DECISION, session=session)

    if not template:
        template = ""
    else:
        template = template.template

    # format student info in template
    formatted_template = template.replace("@firstname", firstname)
    formatted_template = formatted_template.replace("@lastname", lastname)

    receiver_email = email  # Enter receiver address

    subject = "Decision"

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

    # TODO: send websocket message to update sent email
