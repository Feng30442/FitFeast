from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import SignupSerializer, LoginSerializer


def set_jwt_cookies(response, refresh: RefreshToken):
    """JWT を Cookie にセット（Next.js middleware が読む）"""
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        samesite="Lax",
        secure=False,
        path="/",
    )
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        samesite="Lax",
        secure=False,
        path="/",
    )
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    """新規登録 API"""
    serializer = SignupSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()

    refresh = RefreshToken.for_user(user)
    res = Response({"message": "signup success"}, status=201)
    return set_jwt_cookies(res, refresh)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """ログイン API"""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    # username は email を使っている
    user = authenticate(username=email, password=password)
    if not user:
        return Response(
            {"detail": "メールアドレスまたはパスワードが違います"},
            status=400,
        )

    refresh = RefreshToken.for_user(user)
    res = Response({"message": "login success"}, status=200)
    return set_jwt_cookies(res, refresh)


@api_view(["POST"])
def logout(request):
    """ログアウト API（Cookie 削除）"""
    res = Response({"message": "logout success"}, status=200)
    res.delete_cookie("access_token")
    res.delete_cookie("refresh_token")
    return res
