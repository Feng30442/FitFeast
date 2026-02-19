from django.urls import path
from .views import (
    MealCreateView,
    MealTodayListView,
    MealByDateListView,
    MealWeeklySummaryView,
    MealDetailView,
    MealImageUploadView,
    MealAiParseView,   # 👈 新增
    CalorieGoalView,
)

urlpatterns = [
    # 既存 Meal API
    path("meals/", MealCreateView.as_view(), name="meal-create"),
    path("meals/today/", MealTodayListView.as_view(), name="meal-today-list"),
    path("meals/by-date/", MealByDateListView.as_view(), name="meal-by-date"),
    path("meals/weekly-summary/", MealWeeklySummaryView.as_view(), name="meal-weekly-summary"),
    path("meals/<int:pk>/", MealDetailView.as_view(), name="meal-detail"),
    path("meals/<int:meal_id>/image/", MealImageUploadView.as_view(), name="meal-image"),

    # ✅ AI 解析（新增）
    path("ai/parse-meal", MealAiParseView.as_view(), name="ai-parse-meal"),
    # ✅ Profile API
    path("profile/goal/", CalorieGoalView.as_view(), name="profile-goal"),]
