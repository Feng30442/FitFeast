from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer


class JWTCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE")
        raw_token = request.COOKIES.get(cookie_name)

        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except InvalidToken:
            refresh_cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH")
            refresh_token = request.COOKIES.get(refresh_cookie_name)

            if not refresh_token:
                return None

            serializer = TokenRefreshSerializer(data={"refresh": refresh_token})

            try:
                serializer.is_valid(raise_exception=True)
            except TokenError:
                return None

            new_tokens = serializer.validated_data

            request._request.new_tokens = new_tokens

            new_access_token = new_tokens["access"]

            try:
                validated_token = self.get_validated_token(new_access_token)
                return self.get_user(validated_token), validated_token
            except InvalidToken:
                return None
