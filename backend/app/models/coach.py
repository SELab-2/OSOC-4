from odmantic import Model, Field


class Coach(Model):
    email: str = Field(primary_field=True)
    username: str
    password: str
    is_admin: bool
    is_approved: bool
