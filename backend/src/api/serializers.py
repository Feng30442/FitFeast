from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            "min_length": "パスワードは6文字以上で入力してください。",
            "blank": "パスワードを入力してください。",
        },
    )
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="このメールアドレスは既に登録されています。",
            )
        ],
        error_messages={
            "blank": "メールアドレスを入力してください。",
            "invalid": "正しいメールアドレスの形式で入力してください。",
        },
    )

    class Meta:
        model = User
        fields = ("email", "password")

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        # username 必須なので email をそのまま利用
        username = email

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
