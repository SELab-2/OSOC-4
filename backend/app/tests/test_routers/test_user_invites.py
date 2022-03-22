from app.crud import update, read_where
from app.database import db
from app.models.user import User
from app.tests.test_base import TestBase, Status
from app.utils.keygenerators import generate_new_invite_key


class TestUserInvites(TestBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    """
    GET /invite/{invitekey}
    """

    def check_user(self, user: User, expected_values: list, password_empty):
        user_values: list = [user.name, user.email, user.role.value,
                             user.active, user.approved, user.disabled]
        self.assertEqual(expected_values, user_values,
                         f"Something was wrong with the user for {user.email}.\n")
        self.assertTrue((user.password == "") == password_empty,
                        f"Something was wrong with the password for {user.email}.\n")

    async def test_invited_user(self):
        """ Example of post body
        {
            "name": "string",
            "password": "string",
            "validate_password": "string"
        }
        """
        username = "The NewGuy"
        email = "The.NewGuy@test.test"
        password = "ValidPass?!123"
        new_user: User = await update(User.parse_obj({"email": email}))
        body = {
            "name": username,
            "password": password,
            "validate_password": password
        }
        bad_body = {
            "name": username,
            "password": password,
            "validate_password": password + "oeps"
        }

        ###########
        # bad key #
        ###########

        bad_key, time_delta = generate_new_invite_key()  # Correct key with user that doesn't exist
        db.redis.setex(bad_key, time_delta, "00000a00a00aa00aa000aaaa")
        await self.post_response(f"/invite/{bad_key}", body, "", Status.FORBIDDEN, use_access_token=False)

        bad_key = "R" + bad_key[1:]  # Correct key with bad identifier
        db.redis.setex(bad_key, time_delta, str(new_user.id))
        await self.post_response(f"/invite/{bad_key}", body, "", Status.BAD_REQUEST, use_access_token=False)

        bad_key = generate_new_invite_key()[0]  # key that doesn't exist in the db
        await self.post_response(f"/invite/{bad_key}", body, "", Status.BAD_REQUEST, use_access_token=False)

        # Assert that the invites were unsuccessful
        new_user = await read_where(User, User.id == new_user.id)
        self.check_user(new_user, ["", email.lower(), 0, False, False, True], True)

        # Try with activated user
        db.redis.setex(bad_key, time_delta, str(self.objects["user_admin"].id))
        await self.post_response(f"/invite/{bad_key}", body, "", Status.BAD_REQUEST, use_access_token=False)

        # Assert that the invite was unsuccessful
        expected_user = self.objects["user_admin"]
        found_user = await read_where(User, User.id == self.objects["user_admin"].id)
        self.check_user(expected_user,
                        [found_user.name, found_user.email.lower(), found_user.role,
                         found_user.active, found_user.approved, found_user.disabled],
                        False)

        ###############
        # correct key #
        ###############

        key = generate_new_invite_key()
        db.redis.setex(key[0], key[1], str(new_user.id))

        # Try with bad validate_password
        await self.post_response(f"/invite/{key[0]}", bad_body, "", Status.BAD_REQUEST, use_access_token=False)
        # Assert that the invite was unsuccessful
        new_user = await read_where(User, User.id == new_user.id)
        self.check_user(new_user, ["", email.lower(), 0, False, False, True], True)

        # Try successful
        await self.post_response(f"/invite/{key[0]}", body, "", Status.SUCCES, use_access_token=False)
        # Assert that the invite was successful
        new_user = await read_where(User, User.id == new_user.id)
        # check role
        self.check_user(new_user, [username, email.lower(), 0, True, False, True], False)
