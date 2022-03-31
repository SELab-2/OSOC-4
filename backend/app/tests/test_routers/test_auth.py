from typing import Dict

from app.tests.test_base import TestBase, Status, Request


class TestAuth(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def post_login_success(self, email, name, password):
        body: Dict[str, str] = {"email": email, "password": password}
        response = await self.do_request(Request.POST, "/login", name, Status.SUCCESS,
                                         json_body=body, use_access_token=False)
        self.assertTrue("id" in response.json()["data"])

    async def post_login_fail(self, email, name, password):
        body: Dict[str, str] = {"email": email, "password": password}
        response = await self.do_request(Request.POST, "/login", name, Status.UNAUTHORIZED,
                                         json_body=body, use_access_token=False)
        self.assertTrue("message" in response.json())

    async def test_post_login(self):
        user_admin = self.objects["user_admin"]
        user_admin_pass = self.saved_objects["passwords"][user_admin.name]
        user_approved = self.objects["user_approved_coach"]
        user_approved_pass = self.saved_objects["passwords"][user_approved.name]

        # correct login admin & approved user
        await self.post_login_success(user_admin.email, user_admin.name, user_admin_pass)
        await self.post_login_success(user_approved.email, user_approved.name, user_approved_pass)

        # incorrect email or non existing email
        await self.post_login_fail(user_admin.email, user_approved.name, user_approved_pass)
        await self.post_login_fail("IAmANonExistingEmail@something.smth", user_approved.name, user_approved_pass)

        # incorrect password or non existing password
        await self.post_login_fail(user_admin.email, user_admin.name, user_approved_pass)
        await self.post_login_fail(user_admin.email, user_admin.name, "I am a non-existing password")
