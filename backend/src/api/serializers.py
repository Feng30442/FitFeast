from rest_framework import serializers
from .models import Meal


class MealSerializer(serializers.ModelSerializer):
    # フロントの eatenAt <-> モデルの eaten_at を対応させる
    eatenAt = serializers.DateTimeField(source="eaten_at")

    class Meta:
        model = Meal
        fields = [
            "id",
            "name",
            "eatenAt",
            "calorie",
            "tag",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
