from rest_framework.permissions import BasePermission

from .models import User


class HasPuneScenesRole(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in self.allowed_roles
        )


class IsViewer(HasPuneScenesRole):
    allowed_roles = (User.Role.VIEWER,)


class IsHost(HasPuneScenesRole):
    allowed_roles = (User.Role.HOST,)


class IsAdminRole(HasPuneScenesRole):
    allowed_roles = (User.Role.ADMIN,)


class IsHostOrAdmin(HasPuneScenesRole):
    allowed_roles = (User.Role.HOST, User.Role.ADMIN)
