from django.contrib.auth.models import User
from rest_framework import serializers


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ("email", "password")

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        username = email  # User モデルは username 必須 → email をそのまま使う

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
