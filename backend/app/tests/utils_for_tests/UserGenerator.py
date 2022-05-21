from random import choice

from app.models.user import User, UserRole
from app.tests.utils_for_tests.DataGenerator import DataGenerator
from app.utils.cryptography import get_password_hash

from sqlalchemy.ext.asyncio import AsyncSession


class UserGenerator(DataGenerator):
    def __init__(self, session: AsyncSession):
        """
        Initializes the data list and assigns the session to use. Also initializes a dict of passwords.

        :param session: The session to use to add the data to the database
        :type session: AsyncSession
        """
        super().__init__(session)
        self.passwords: dict[str, str] = {}

    def generate_default_users(self) -> None:
        """
        Generates the default users for testing.

        :return: None
        """
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
                disabled=True)
        ]
        self.passwords = {user.name: user.password for user in self.data}
        for user in self.data:
            user.password = get_password_hash(user.password)

    def generate_user(self, role=UserRole.COACH, active=True, approved=True, disabled=False) -> User:
        """
        Generates a user.

        :param role: The role of the generated user
        :type role: UserRole, optional
        :param active: The active status of the generated user
        :type active: bool, optional
        :param approved: The approval status of the generated user
        :type approved: bool, optional
        :param disabled: Whether the generated user should be disabled
        :type disabled: bool, optional
        :return: The generated User
        :rtype: User
        """
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

    def generate_users(self, n=1, role=UserRole.COACH) -> list[User]:
        """
        Generates 'n' users

        :param n: The amount of users to generate
        :type n: int
        :param role: The role of the generated users
        :type role: UserRole
        :return: The generated users
        :rtype: list[User]
        """
        return [self.generate_user(role) for _ in range(n)]
