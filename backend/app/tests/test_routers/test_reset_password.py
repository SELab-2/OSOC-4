from app.database import db
from app.models.user import User
from app.tests.test_base import TestBase, Request, Status
from app.utils.cryptography import verify_password
from app.utils.keygenerators import generate_new_reset_password_key, generate_new_invite_key


class TestResetPassword(TestBase):
    new_pass: str = "ValidPass?!123"
    body: dict[str, str] = {"password": new_pass, "validate_password": new_pass}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def test_valid_resetkey_with_correct_key(self):
        path = "/resetpassword/"
        user: User = await self.get_user_by_name("user_admin")

        # correct key
        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], user.id)
        await self.do_request(Request.GET, f"{path}{key[0]}", expected_status=Status.SUCCESS)

    async def test_valid_resetkey_with_invalid_id(self):
        path = "/resetpassword/"

        # key with bad user id
        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], "bad_user_id")
        await self.do_request(Request.GET, f"{path}{key[0]}", expected_status=Status.BAD_REQUEST)

    async def test_valid_resetkey_with_user_not_in_db(self):
        path = "/resetpassword/"

        # key without user connected to id
        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], self.bad_id)
        await self.do_request(Request.GET, f"{path}{key[0]}", expected_status=Status.BAD_REQUEST)

    async def test_valid_resetkey_with_invitekey(self):
        path = "/resetpassword/"
        user: User = await self.get_user_by_name("user_admin")

        # Bad key
        key = generate_new_invite_key()
        bad_key = "I" + key[0][1:]
        db.redis.setex(bad_key, key[1], user.id)
        await self.do_request(Request.GET, f"{path}{bad_key}", expected_status=Status.BAD_REQUEST)

    async def test_use_resetkey_with_invalid_keys(self):
        path = "/resetpassword/"

        # Request using invalid reset keys
        await self.do_request(Request.POST, f"{path}Rohnonotsogood", json_body=self.body,
                              expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.POST, f"{path}Iohnoevenworse", json_body=self.body,
                              expected_status=Status.BAD_REQUEST)

    async def test_use_resetkey_with_bad_user_id(self):
        path = "/resetpassword/"

        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], self.bad_id)
        await self.do_request(Request.POST, f"{path}{key[0]}", json_body=self.body, expected_status=Status.FORBIDDEN)

    async def test_use_resetkey_with_inactive_user(self):
        path = "/resetpassword/"

        # Test with an inactive user
        key = generate_new_reset_password_key()
        user: User = await self.get_user_by_name("user_unactivated_coach")
        db.redis.setex(key[0], key[1], user.id)
        await self.do_request(Request.POST, f"{path}{key[0]}", json_body=self.body, expected_status=Status.FORBIDDEN)

        # Check passwords aren't changed
        user = await self.get_user_by_name("user_unactivated_coach")
        self.assertTrue(verify_password(self.saved_objects["passwords"][user.name], user.password),
                        "The password of an unactivated user was changed.")

    async def test_use_resetkey_with_bad_validation(self):
        path = "/resetpassword/"

        # create a real key
        key = generate_new_reset_password_key()
        user = await self.get_user_by_name("user_approved_coach")
        db.redis.setex(key[0], key[1], int(user.id))

        # Test using a wrong validate password
        await self.do_request(Request.POST, f"{path}{key[0]}",
                              json_body={"password": self.new_pass, "validate_password": self.new_pass + "1"},
                              expected_status=Status.BAD_REQUEST)

        # Check passwords aren't changed
        user = await self.get_user_by_name("user_approved_coach")
        self.assertTrue(verify_password(self.saved_objects["passwords"][user.name], user.password),
                        "The password was changed after using a wrong validate_password.")

    async def test_use_resetkey_correct(self):
        path = "/resetpassword/"

        # create a real key
        key = generate_new_reset_password_key()
        user = await self.get_user_by_name("user_approved_coach")
        db.redis.setex(key[0], key[1], int(user.id))

        # change to new password
        await self.do_request(Request.POST, f"{path}{key[0]}", json_body=self.body, expected_status=Status.SUCCESS)

        # Check current passwords
        user = await self.get_user_by_name("user_approved_coach")
        self.assertTrue(verify_password(self.new_pass, user.password),
                        "The password wasn't changed after a successful request")
