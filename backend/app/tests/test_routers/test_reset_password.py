from app.database import db
from app.models.user import User
from app.tests.test_base import TestBase, Request, Status
from app.utils.cryptography import verify_password
from app.utils.keygenerators import generate_new_reset_password_key


class TestResetPassword(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def test_valid_resetkey(self):
        path = "/resetpassword/"

        user: User = await self.get_user_by_name("user_admin")

        # correct key
        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], user.id)
        await self.do_request(Request.GET, f"{path}{key[0]}", expected_status=Status.SUCCESS)

        # key with bad user id
        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], "bad_user_id")
        await self.do_request(Request.GET, f"{path}{key[0]}", expected_status=Status.BAD_REQUEST)

        # key without user connected to id
        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], self.bad_id)
        await self.do_request(Request.GET, f"{path}{key[0]}", expected_status=Status.BAD_REQUEST)

        # Bad key
        key = generate_new_reset_password_key()
        bad_key = "I" + key[0][1:]
        db.redis.setex(bad_key, key[1], user.id)
        await self.do_request(Request.GET, f"{path}{bad_key}", expected_status=Status.BAD_REQUEST)

    async def test_use_resetkey(self):
        path = "/resetpassword/"

        new_pass: str = "ValidPass?!123"
        body = {"password": new_pass, "validate_password": new_pass}

        # Request using invalid reset keys
        await self.do_request(Request.POST, f"{path}Rohnonotsogood", json_body=body, expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.POST, f"{path}Iohnoevenworse", json_body=body, expected_status=Status.BAD_REQUEST)

        # Test with a bad userid
        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], self.bad_id)
        await self.do_request(Request.POST, f"{path}{key[0]}", json_body=body, expected_status=Status.FORBIDDEN)

        # Test with an inactive user
        key = generate_new_reset_password_key()
        user: User = await self.get_user_by_name("user_unactivated_coach")
        db.redis.setex(key[0], key[1], user.id)
        await self.do_request(Request.POST, f"{path}{key[0]}", json_body=body, expected_status=Status.FORBIDDEN)

        # create a real key
        key = generate_new_reset_password_key()
        user = await self.get_user_by_name("user_approved_coach")
        db.redis.setex(key[0], key[1], int(user.id))

        # Test using a wrong validate password
        await self.do_request(Request.POST, f"{path}{key[0]}",
                              json_body={"password": new_pass, "validate_password": new_pass + "1"},
                              expected_status=Status.BAD_REQUEST)

        ##################################
        # Check passwords aren't changed #
        ##################################
        user = await self.get_user_by_name("user_approved_coach")
        self.assertTrue(verify_password(self.saved_objects["passwords"][user.name], user.password),
                        "The password was changed after bad requests")

        #####################
        # Do a good request #
        #####################
        # change to new password
        await self.do_request(Request.POST, f"{path}{key[0]}", json_body=body, expected_status=Status.SUCCESS)

        ###########################
        # Check current passwords #
        ###########################
        user = await self.get_user_by_name("user_approved_coach")
        self.assertTrue(verify_password(new_pass, user.password),
                        "The password wasn't changed after successful request")
