# すでにある import に続けて
from rest_framework import generics, permissions
from django.utils import timezone
from .models import Meal
from .serializers import MealSerializer


class MealCreateView(generics.CreateAPIView):
    queryset = Meal.objects.all()
    serializer_class = MealSerializer
    permission_classes = [permissions.AllowAny]


class MealTodayListView(generics.ListAPIView):
    """
    今日の食事を一覧取得するAPI
    GET /api/meals/today/
    """
    serializer_class = MealSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        today = timezone.localdate()  # 今日の日付
        return Meal.objects.filter(eaten_at__date=today).order_by("eaten_at")
