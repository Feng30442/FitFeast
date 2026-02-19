from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator 
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


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    daily_calorie_goal = models.PositiveIntegerField(
        default=1800,
        validators=[MinValueValidator(800), MaxValueValidator(5000)],
    )

    def __str__(self):
        return f"{self.user.username} profile"


from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)