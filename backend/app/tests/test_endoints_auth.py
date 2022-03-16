from app.tests.test_base import TestBase, Status


class TestEndpointAuthorization(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def test_get_endpoints(self):
        eps = [
            "/users/",
            f"/users/{self.objects['user_admin'].id}"
        ]

        for ep in eps:
            # No authorization
            await self.get_response(ep, "user_admin", Status.UNAUTHORIZED, use_access_token=False)
            # Wrong authorization
            await self.get_response(ep, "user_admin", Status.UNAUTHORIZED, access_token="wrong token")

    async def test_post_endpoints(self):
        eps = {
            "/users/create": {"email": "noAuth@test.be", "password": "JustaPassword!123"}
        }

        for ep, body in eps.items():
            # No authorization
            await self.post_response(ep, body, "user_admin", Status.UNAUTHORIZED, use_access_token=False)
            # Wrong authorization
            await self.post_response(ep, body, "user_admin", Status.UNAUTHORIZED, access_token="wrong token")
