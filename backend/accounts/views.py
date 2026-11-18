from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import LoginTokenSerializer, LogoutSerializer, RegistrationSerializer, UserSerializer


class RegistrationView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = (AllowAny,)


class LoginView(TokenObtainPairView):
    serializer_class = LoginTokenSerializer
    permission_classes = (AllowAny,)


class RefreshView(TokenRefreshView):
    permission_classes = (AllowAny,)


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = LogoutSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_205_RESET_CONTENT)
