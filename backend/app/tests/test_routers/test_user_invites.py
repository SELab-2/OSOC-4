from app.crud import update, read_where
from app.database import db
from app.models.user import User
from app.tests.test_base import TestBase, Status, Request
from app.utils.keygenerators import generate_new_invite_key, generate_new_reset_password_key


class TestUserInvites(TestBase):
    username = "The NewGuy"
    email = "The.NewGuy@test.test"
    password = "ValidPass?!123"

    body = {
        "name": username,
        "password": password,
        "validate_password": password
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    ########################
    # test_valid_invitekey #
    ########################
    async def test_valid_invitekey(self):
        path = "/invite/"
        new_user: User = await update(User.parse_obj({"email": "new.mail@test.test"}), session=self.session)

        # correct key
        key = generate_new_invite_key()
        db.redis.setex(key[0], key[1], new_user.id)
        await self.do_request(Request.GET, f"{path}{key[0]}", expected_status=Status.SUCCESS)

    async def test_valid_invitekey_key_invalid_id(self):
        path = "/invite/"

        # key with bad user id
        key = generate_new_invite_key()
        db.redis.setex(key[0], key[1], "bad_user_id")
        await self.do_request(Request.GET, f"{path}{key[0]}", expected_status=Status.BAD_REQUEST)

    async def test_valid_invitekey_key_with_user_not_in_db(self):
        path = "/invite/"

        # key without user connected to id
        key = generate_new_invite_key()
        db.redis.setex(key[0], key[1], self.bad_id)
        await self.do_request(Request.GET, f"{path}{key[0]}", expected_status=Status.BAD_REQUEST)

    async def test_valid_invitekey_with_reset_key(self):
        path = "/invite/"

        new_user: User = await update(User.parse_obj({"email": "new.mail@test.test"}), session=self.session)
        key = generate_new_reset_password_key()
        db.redis.setex(key[0], key[1], new_user.id)
        await self.do_request(Request.GET, f"{path}{key[0]}", expected_status=Status.BAD_REQUEST)

    #####################
    # test_invited_user #
    #####################
    async def test_invited_user_with_uid_not_in_db(self):
        path = "/invite/"

        key, time_delta = generate_new_invite_key()
        db.redis.setex(key, time_delta, self.bad_id)
        await self.do_request(Request.POST, f"{path}{key}", expected_status=Status.FORBIDDEN, json_body=self.body)

    async def test_invited_user_with_reset_password_key(self):
        path = "/invite/"
        new_user: User = await update(User.parse_obj({"email": self.email}), session=self.session)

        bad_key, time_delta = generate_new_reset_password_key()
        db.redis.setex(bad_key, time_delta, new_user.id)
        await self.do_request(Request.POST, f"{path}{bad_key}", expected_status=Status.BAD_REQUEST, json_body=self.body)

        # Assert that the invite was unsuccessful
        new_user = await read_where(User, User.id == new_user.id, session=self.session)
        self.check_user(new_user, ["", self.email.lower(), 0, False, False, True], True)

    async def test_invited_user_with_key_not_in_db(self):
        path = "/invite/"

        key = generate_new_invite_key()[0]  # key that doesn't exist in the db
        await self.do_request(Request.POST, f"{path}{key}", expected_status=Status.BAD_REQUEST, json_body=self.body)

    async def test_invited_user_with_active_user(self):
        path = "/invite/"

        # Try with activated user
        user = await self.get_user_by_name("user_admin")
        key, time_delta = generate_new_invite_key()
        db.redis.setex(key, time_delta, user.id)
        await self.do_request(Request.POST, f"{path}{key}", expected_status=Status.BAD_REQUEST, json_body=self.body)

        # Assert that the invite was unsuccessful
        # todo

    async def test_invited_user_with_active_user(self):
        path = "/invite/"
        new_user: User = await update(User.parse_obj({"email": self.email}), session=self.session)

        bad_body = {
            "name": self.username,
            "password": self.password,
            "validate_password": self.password + "oeps"
        }

        key = generate_new_invite_key()
        db.redis.setex(key[0], key[1], new_user.id)

        # Try with bad validate_password
        await self.do_request(Request.POST, f"{path}{key[0]}", expected_status=Status.BAD_REQUEST, json_body=bad_body)
        # Assert that the invite was unsuccessful
        new_user = await read_where(User, User.id == new_user.id, session=self.session)
        self.check_user(new_user, ["", self.email.lower(), 0, False, False, True], True)

    async def test_invited_user(self):
        path = "/invite/"
        new_user: User = await update(User.parse_obj({"email": self.email}), session=self.session)

        key = generate_new_invite_key()
        db.redis.setex(key[0], key[1], new_user.id)

        # Try successful
        await self.do_request(Request.POST, f"{path}{key[0]}", expected_status=Status.SUCCESS, json_body=self.body)
        # Assert that the invite was successful
        new_user = await read_where(User, User.id == new_user.id, session=self.session)
        # check role
        self.check_user(new_user, [self.username, self.email.lower(), 0, True, False, True], False)

    def check_user(self, user: User, expected_values: list, password_empty):
        user_values: list = [user.name, user.email, user.role,
                             user.active, user.approved, user.disabled]
        self.assertEqual(expected_values, user_values,
                         f"Something was wrong with the user for {user.email}.\n")
        self.assertTrue((user.password == "") == password_empty,
                        f"Something was wrong with the password for {user.email}.\n")
