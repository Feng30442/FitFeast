from rest_framework import serializers
from .models import Meal, Profile


class MealSerializer(serializers.ModelSerializer):
    # フロントの eatenAt <-> モデルの eaten_at を対応させる
    eatenAt = serializers.DateTimeField(source="eaten_at")
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Meal
        fields = [
            "id",
            "name",
            "eatenAt",
            "calorie",
            "tag",
            "created_at",
            "image_url",
        ]
        read_only_fields = ["id", "created_at"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if not obj.image:
            return None
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url


class CalorieGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["daily_calorie_goal"]
