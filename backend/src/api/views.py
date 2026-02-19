# すでにある import に続けて
from rest_framework import generics, permissions
from django.utils import timezone
from .models import Meal
from .serializers import MealSerializer, CalorieGoalSerializer
from datetime import datetime, timedelta
from django.utils import timezone as dj_timezone
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response

import os
import json
from json import JSONDecoder
from openai import OpenAI
import traceback
import re
from django.conf import settings

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


class CalorieGoalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        serializer = CalorieGoalSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        print("PATCH data:", request.data)  # 追加
        profile = request.user.profile
        serializer = CalorieGoalSerializer(profile, data=request.data, partial=True)
        if not serializer.is_valid():
            print("serializer errors:", serializer.errors)  # 追加
            return Response(serializer.errors, status=400)
        serializer.save()
        return Response(serializer.data, status=200)


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

# ===============================
# AI：文字解析食事（最短版）
# POST /api/ai/parse-meal
# ===============================

_openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

MEAL_SCHEMA = {
    "name": "meal_parse",
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "name": {"type": "string"},
            "calorie": {"type": "integer", "minimum": 0, "maximum": 5000},
            "tag": {"type": "string"},
            "eatenAt": {"type": "string", "description": "ISO 8601 datetime"},
            "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        },
        "required": ["name", "calorie", "tag", "eatenAt", "confidence"],
    },
    "strict": True,
}


class MealAiParseView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"error": "text is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            model = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")

            resp = _openai_client.responses.create(
                model=model,
                input=[
                    {
                        "role": "system",
                        "content": (
                            "Return ONLY one JSON object. Do not include any other text. "
                            "Schema: {"
                            "\"name\": string, "
                            "\"calorie\": integer, "
                            "\"tag\": string, "
                            "\"eatenAt\": string ISO8601, "
                            "\"confidence\": number 0-1"
                            "}. "
                            "tag should be one of: 外食, 自炊, 和食, 洋食, 間食. "
                            "If unclear, make a reasonable estimate."
                        ),
                    },
                    {"role": "user", "content": text},
                ],
                store=False,
            )

            raw = (resp.output_text or "").strip()

            # ✅ 強健：括号配对で最初の完全な JSON オブジェクトを抽出
            decoder = JSONDecoder()

            # 1) 先に ``` コード块 wrapper を削除
            if raw.startswith("```"):
                raw = re.sub(r"^```[a-zA-Z]*\n", "", raw)
                raw = re.sub(r"\n```$", "", raw).strip()

            # 2) 最初の '{' を見つけ、そこから decode
            start = raw.find("{")
            if start == -1:
                return Response(
                    {"error": "AI returned no JSON object", "raw": raw[:300]},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            try:
                obj, idx = decoder.raw_decode(raw[start:])
                data = obj
            except Exception:
                # 3) なお失敗：raw の最初 300 字を返して定位する
                return Response(
                    {"error": "Failed to parse JSON from AI output", "raw": raw[:300]},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            # ✅ ここで本当の原因がターミナルに出る
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
