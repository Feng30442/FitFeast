from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings 
class User(AbstractUser):
    # 追加フィールドがあればここ
    pass

class Meal(models.Model):
    # ユーザーに紐付けたいなら AUTH_USER_MODEL を使う
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="meals",
        null=True,  # いったん null OK にしておくと楽
        blank=True,
    )
    name = models.CharField("食事名", max_length=100)
    eaten_at = models.DateTimeField("食事日時")
    calorie = models.PositiveIntegerField("カロリー(kcal)")
    tag = models.CharField("タグ", max_length=30)
    created_at = models.DateTimeField("作成日時", auto_now_add=True)
    image = models.ImageField(
        upload_to="meals/",
        null=True,
        blank=True
    )

    class Meta:
        ordering = ["-eaten_at"]

    def __str__(self) -> str:
        return f"{self.name} - {self.calorie} kcal"