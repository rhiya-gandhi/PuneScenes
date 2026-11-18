from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import HostProfile, ViewerProfile


User = get_user_model()
PASSWORD = 'Pune#Arts2026_River'


class AuthenticationApiTests(APITestCase):
    register_url = '/api/accounts/register/'
    login_url = '/api/accounts/login/'
    refresh_url = '/api/accounts/token/refresh/'
    me_url = '/api/accounts/me/'
    logout_url = '/api/accounts/logout/'

    def registration_data(self, **overrides):
        data = {
            'first_name': 'Asha',
            'last_name': 'Kulkarni',
            'email': 'asha@example.com',
            'password': PASSWORD,
            'confirm_password': PASSWORD,
            'role': User.Role.VIEWER,
        }
        data.update(overrides)
        return data

    def test_viewer_registration_creates_profile_and_hashes_password(self):
        response = self.client.post(self.register_url, self.registration_data(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='asha@example.com')
        self.assertTrue(user.check_password(PASSWORD))
        self.assertNotEqual(user.password, PASSWORD)
        self.assertTrue(ViewerProfile.objects.filter(user=user).exists())
        self.assertFalse(HostProfile.objects.filter(user=user).exists())

    def test_host_registration_requires_organization_and_creates_profile(self):
        missing_org = self.client.post(
            self.register_url,
            self.registration_data(role=User.Role.HOST),
            format='json',
        )
        self.assertEqual(missing_org.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.post(
            self.register_url,
            self.registration_data(role=User.Role.HOST, organization_name='Pune Arts Collective'),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='asha@example.com')
        self.assertEqual(user.host_profile.organization_name, 'Pune Arts Collective')

    def test_host_can_log_in_and_read_host_profile(self):
        self.client.post(
            self.register_url,
            self.registration_data(role=User.Role.HOST, organization_name='Pune Arts Collective'),
            format='json',
        )
        login = self.client.post(
            self.login_url,
            {'email': 'asha@example.com', 'password': PASSWORD},
            format='json',
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        current_user = self.client.get(self.me_url)
        self.assertEqual(current_user.status_code, status.HTTP_200_OK)
        self.assertEqual(current_user.data['role'], User.Role.HOST)
        self.assertEqual(
            current_user.data['profile']['organization_name'],
            'Pune Arts Collective',
        )

    def test_public_registration_cannot_create_admin(self):
        response = self.client.post(
            self.register_url,
            self.registration_data(role=User.Role.ADMIN),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email='asha@example.com').exists())

    def test_registration_rejects_password_mismatch(self):
        response = self.client.post(
            self.register_url,
            self.registration_data(confirm_password='A-different-password!2026'),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_current_user_refresh_and_logout(self):
        user = User.objects.create_user(
            email='asha@example.com',
            password=PASSWORD,
            first_name='Asha',
            last_name='Kulkarni',
        )
        ViewerProfile.objects.create(user=user, home_area='Kothrud', interests=['music'])

        login = self.client.post(
            self.login_url,
            {'email': user.email, 'password': PASSWORD},
            format='json',
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn('access', login.data)
        self.assertIn('refresh', login.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        current_user = self.client.get(self.me_url)
        self.assertEqual(current_user.status_code, status.HTTP_200_OK)
        self.assertEqual(current_user.data['role'], User.Role.VIEWER)
        self.assertEqual(current_user.data['profile']['home_area'], 'Kothrud')

        refresh = self.client.post(
            self.refresh_url,
            {'refresh': login.data['refresh']},
            format='json',
        )
        self.assertEqual(refresh.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh.data)

        logout = self.client.post(
            self.logout_url,
            {'refresh': refresh.data['refresh']},
            format='json',
        )
        self.assertEqual(logout.status_code, status.HTTP_205_RESET_CONTENT)

        reuse = self.client.post(
            self.refresh_url,
            {'refresh': refresh.data['refresh']},
            format='json',
        )
        self.assertEqual(reuse.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_current_user_requires_authentication(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
