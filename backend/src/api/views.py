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


class MealDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/meals/<id>/        : 単体取得
    PUT    /api/meals/<id>/        : 全更新
    PATCH  /api/meals/<id>/        : 部分更新（おすすめ）
    DELETE /api/meals/<id>/        : 削除
    """
    queryset = Meal.objects.all()
    serializer_class = MealSerializer
    permission_classes = [permissions.AllowAny]  # いまは開発用

    # もしURLが pk じゃなく meal_id 等ならこれを使う：
    # lookup_url_kwarg = "meal_id"
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


from rest_framework import status, parsers
from django.shortcuts import get_object_or_404


class MealImageUploadView(APIView):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request, meal_id: int):
        meal = get_object_or_404(Meal, pk=meal_id)

        image = request.FILES.get("image")
        if not image:
            return Response({"detail": "image is required"}, status=status.HTTP_400_BAD_REQUEST)

        meal.image = image
        meal.save()

        return Response(MealSerializer(meal, context={"request": request}).data, status=status.HTTP_200_OK)
