from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import UserSerializer


class GetUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username

        return Response({"username": username})


class SignInView(TokenObtainPairView):
    """
    ログインしてアクセストークンとリフレッシュトークンを
    HttpOnly Cookieにセットする
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                access_token = response.data.get("access")
                refresh_token = response.data.get("refresh")

                del response.data["access"]
                del response.data["refresh"]
                response.data["message"] = "ログインに成功しました。"

                response.set_cookie(
                    key=settings.SIMPLE_JWT["AUTH_COOKIE"],
                    value=access_token,
                    httponly=True,
                    secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                    samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                )
                response.set_cookie(
                    key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
                    value=refresh_token,
                    httponly=True,
                    secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                    samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                )
                return response
        except Exception:
            pass

        return Response(
            {"message": "ユーザー名とパスワードが一致しません"},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


class SignOutView(APIView):
    """
    ログアウトしてCookieを削除する
    """

    permission_classes = [AllowAny]

    def delete(self, *args, **kwargs):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(settings.SIMPLE_JWT["AUTH_COOKIE"])
        response.delete_cookie(settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"])
        return response


class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "ユーザー登録が成功しました。"}, status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
