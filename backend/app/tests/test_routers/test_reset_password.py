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

        key = generate_new_reset_password_key()
        forgotten_user = await self.get_user_by_name("user_approved_coach")
        db.redis.setex(key[0], key[1], int(forgotten_user.id))

        # Test using a wrong validate password
        await self.do_request(Request.POST, f"{path}{key[0]}",
                              json_body={"password": new_pass, "validate_password": new_pass + "1"},
                              expected_status=Status.BAD_REQUEST)

        # Request using invalid reset keys
        await self.do_request(Request.POST, f"{path}Rohnonotsogood",
                              json_body={"password": new_pass, "validate_password": new_pass},
                              expected_status=Status.BAD_REQUEST)
        await self.do_request(Request.POST, f"{path}Iohnoevenworse",
                              json_body={"password": new_pass, "validate_password": new_pass},
                              expected_status=Status.BAD_REQUEST)

        ##################################
        # Check passwords aren't changed #
        ##################################
        forgotten_user = await self.get_user_by_name("user_approved_coach")
        self.assertTrue(verify_password(self.saved_objects["passwords"][forgotten_user.name], forgotten_user.password),
                        "The password was changed after bad requests")

        #####################
        # Do a good request #
        #####################
        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], int(forgotten_user.id))

        # change to new password
        await self.do_request(Request.POST, f"{path}{key}",
                              json_body={"password": new_pass, "validate_password": new_pass},
                              expected_status=Status.BAD_REQUEST)

        ###########################
        # Check current passwords #
        ###########################
        forgotten_user = await self.get_user_by_name("user_approved_coach")
        self.assertFalse(verify_password(new_pass, forgotten_user.password),
                         "The password was changed after successful request")
