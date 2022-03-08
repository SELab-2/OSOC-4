from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import ssl
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv('SMTP_SERVER')
SMTP_SSL_PORT = os.getenv('SMTP_SSL_PORT')
SENDER_EMAIL = os.getenv('SENDER_EMAIL')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD')


def send_invite(email: str, invitekey: str):
    """send_invite this functions sents an invite email

    :param email: email of the receiver
    :type email: str
    :param invitekey: the invitekey used to identify the user
    :type invitekey: str
    """
    receiver_email = email  # Enter receiver address

    subject = "Activate OSOC Account"
    body = f"Use this link to activate your account http://localhost:8000/invite/{invitekey}"

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
