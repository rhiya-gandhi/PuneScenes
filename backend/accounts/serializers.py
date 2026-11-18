from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import HostProfile, User, ViewerProfile


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'role', 'date_joined', 'profile')
        read_only_fields = fields

    def get_profile(self, user):
        if user.role == User.Role.VIEWER:
            profile = getattr(user, 'viewer_profile', None)
            if profile is None:
                return None
            return {'home_area': profile.home_area, 'interests': profile.interests}

        if user.role == User.Role.HOST:
            profile = getattr(user, 'host_profile', None)
            if profile is None:
                return None
            return {
                'organization_name': profile.organization_name,
                'host_type': profile.host_type,
                'about': profile.about,
                'website_url': profile.website_url,
                'social_media_link': profile.social_media_link,
            }

        return None


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)
    organization_name = serializers.CharField(required=False, allow_blank=False, max_length=200)

    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'email', 'password', 'confirm_password',
            'role', 'organization_name',
        )

    def validate_email(self, value):
        normalized = User.objects.normalize_email(value).strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return normalized

    def validate_role(self, value):
        if value not in (User.Role.VIEWER, User.Role.HOST):
            raise serializers.ValidationError('Choose Viewer or Host.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        password_user = User(
            email=attrs.get('email', ''),
            first_name=attrs.get('first_name', ''),
            last_name=attrs.get('last_name', ''),
        )
        validate_password(attrs['password'], user=password_user)

        organization_name = attrs.get('organization_name', '').strip()
        if attrs['role'] == User.Role.HOST and not organization_name:
            raise serializers.ValidationError({
                'organization_name': 'Organization name is required for Host accounts.'
            })
        attrs['organization_name'] = organization_name
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        organization_name = validated_data.pop('organization_name', '')
        user = User.objects.create_user(password=password, **validated_data)

        if user.role == User.Role.VIEWER:
            ViewerProfile.objects.create(user=user)
        else:
            HostProfile.objects.create(user=user, organization_name=organization_name)
        return user


class LoginTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate_refresh(self, value):
        from rest_framework_simplejwt.exceptions import TokenError
        from rest_framework_simplejwt.tokens import RefreshToken

        try:
            self.refresh_token = RefreshToken(value)
        except TokenError as exc:
            raise serializers.ValidationError('Refresh token is invalid or expired.') from exc
        request_user = self.context['request'].user
        if str(self.refresh_token.get('user_id')) != str(request_user.pk):
            raise serializers.ValidationError('Refresh token does not belong to this account.')
        return value

    def save(self, **kwargs):
        self.refresh_token.blacklist()
