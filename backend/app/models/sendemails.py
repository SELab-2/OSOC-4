from typing import List

from pydantic import BaseModel


class SendEmails(BaseModel):
    """the expected input model for sending an email to a group of students
    """
    emails: List[str]


class SendCustomEmail(BaseModel):
    """the expected input model for sending a custom email to a student
    """
    student: str
    subject: str
    email: str
