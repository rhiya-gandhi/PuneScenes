from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserManager(BaseUserManager):
    """Create users using email as their unique login identifier."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('An email address is required.')
        email = self.normalize_email(email).strip().lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('role', User.Role.VIEWER)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields['role'] = User.Role.ADMIN

        if extra_fields['is_staff'] is not True:
            raise ValueError('A superuser must have is_staff=True.')
        if extra_fields['is_superuser'] is not True:
            raise ValueError('A superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        VIEWER = 'viewer', 'Viewer'
        HOST = 'host', 'Host'
        ADMIN = 'admin', 'Admin'

    username = None
    email = models.EmailField('email address', unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.VIEWER)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    def __str__(self):
        return self.email


class ViewerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='viewer_profile',
    )
    home_area = models.CharField(max_length=120, blank=True)
    interests = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f'Viewer profile: {self.user.email}'


class HostProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='host_profile',
    )
    organization_name = models.CharField(max_length=200)
    host_type = models.CharField(max_length=100, blank=True)
    about = models.TextField(blank=True)
    website_url = models.URLField(blank=True)
    social_media_link = models.URLField(blank=True)

    def __str__(self):
        return self.organization_name
