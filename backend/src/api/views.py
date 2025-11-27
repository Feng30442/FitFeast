# すでにある import に続けて
from rest_framework import generics, permissions
from django.utils import timezone
from .models import Meal
from .serializers import MealSerializer
from datetime import datetime, timedelta
from django.utils import timezone as dj_timezone
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response


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


# 日付指定で、その日の食事一覧を返す
class MealByDateListView(generics.ListAPIView):
    serializer_class = MealSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        date_str = self.request.query_params.get("date")
        if date_str:
            try:
                target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                target_date = dj_timezone.localdate()
        else:
            target_date = dj_timezone.localdate()

        return Meal.objects.filter(
            eaten_at__date=target_date
        ).order_by("eaten_at")


# 直近1週間の合計カロリーを日別に返す
class MealWeeklySummaryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        today = dj_timezone.localdate()
        start = today - timedelta(days=6)  # 6日前〜今日 = 7日分

        qs = (
            Meal.objects
            .filter(eaten_at__date__range=(start, today))
            .values("eaten_at__date")
            .annotate(total_calorie=Sum("calorie"))
        )

        # {日付: 合計kcal} な dict に変換
        total_map = {
            row["eaten_at__date"]: row["total_calorie"] for row in qs
        }

        # 6日前〜今日まで、穴埋めしながら配列にする
        data = []
        for i in range(7):
            d = start + timedelta(days=i)
            data.append(
                {
                    "date": d.isoformat(),                  # "2025-11-27"
                    "totalCalorie": total_map.get(d, 0),    # その日の合計
                }
            )

        return Response(data)
