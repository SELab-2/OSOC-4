from typing import List

from pydantic import BaseModel


class SendEmails(BaseModel):
    emails: List[str]


class SendCustomEmail(BaseModel):
    student: str
    subject: str
    email: str
