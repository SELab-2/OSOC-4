from random import choice

from app.models.user import User, UserRole
from app.tests.utils_for_tests.DataGenerator import DataGenerator
from app.utils.cryptography import get_password_hash


class UserGenerator(DataGenerator):
    def __init__(self, session):
        super().__init__(session)
        self.passwords = {}

    def generate_default_users(self):
        self.data += [
            User(
                email="user_admin@test.be",
                name="user_admin",
                password="Test123!user_admin",
                role=UserRole.ADMIN,
                active=True, approved=True, disabled=False),
            User(
                email="user_coach@test.be",
                name="coach",
                password="Test123!user_coach",
                role=UserRole.COACH,
                active=True, approved=True, disabled=False),
            User(
                email="user_approved_coach@test.be",
                name="user_approved_coach",
                password="Test123!user_approved_coach",
                role=UserRole.COACH,
                active=True,
                approved=True,
                disabled=False),
            User(
                email="user_activated_coach@test.be",
                name="user_activated_coach",
                password="Test123!user_activated_coach",
                role=UserRole.COACH,
                active=True,
                approved=False,
                disabled=False),
            User(
                email="user_unactivated_coach@test.be",
                name="user_unactivated_coach",
                password="Test123!user_unactivated_coach",
                role=UserRole.COACH,
                active=False,
                approved=False,
                disabled=False),
            User(
                email="user_disabled_coach@test.be",
                name="user_disabled_coach",
                password="Test123!user_disabled_coach",
                role=UserRole.COACH,
                active=True,
                approved=True,
                disabled=True),
            User(
                email="user_no_role@test.be",
                name="user_no_role",
                password="Test123!user_no_role",
                role=UserRole.NO_ROLE,
                active=False,
                approved=False,
                disabled=False)
        ]
        self.passwords = {user.name: user.password for user in self.data}
        for user in self.data:
            user.password = get_password_hash(user.password)

    def generate_user(self, role=UserRole.COACH, active=True, approved=True, disabled=False):
        first_name = choice(self.first_names)
        last_name = choice(self.last_names)

        user = User(email=f"{first_name.lower()}.{last_name.lower()}@{choice(self.emails)}",
                    name=f"{first_name} {last_name}",
                    password=get_password_hash("justapassword"),
                    role=role,
                    active=active, approved=approved, disabled=disabled)
        self.passwords[user.name] = "justapassword"
        self.data.append(user)
        return user

    def generate_users(self, n=1, role=UserRole.COACH):
        return [self.generate_user(role) for _ in range(n)]
