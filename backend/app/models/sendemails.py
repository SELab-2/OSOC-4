from typing import List

from pydantic import BaseModel


class SendEmails(BaseModel):
    emails: List[str]
