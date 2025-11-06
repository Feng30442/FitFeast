import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Creates a superuser from environment variables."

    def handle(self, *args, **options):
        username = os.environ.get("ADMIN_USER")
        password = os.environ.get("ADMIN_PASS")

        if not username or not password:
            self.stdout.write(
                self.style.ERROR("Environment variables ADMIN_USER and ADMIN_PASS must be set.")
            )
            return

        # すでにユーザーが存在しない場合のみ作成
        if not User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(f"Creating superuser: {username}"))
            User.objects.create_superuser(username=username, password=password)
        else:
            self.stdout.write(self.style.WARNING(f'Superuser "{username}" already exists.'))
