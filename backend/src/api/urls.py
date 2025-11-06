from django.urls import path

from .views import GetUserView, SignInView, SignOutView, SignUpView

urlpatterns = [
    path("auth/signup/", SignUpView.as_view(), name="signup"),
    path("auth/user/", GetUserView.as_view(), name="get_user"),
    path("auth/signin/", SignInView.as_view(), name="signin"),
    path("auth/signout/", SignOutView.as_view(), name="signout"),
]
