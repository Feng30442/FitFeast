from django.urls import path
from .views import (
    MealCreateView,
    MealTodayListView,
    MealByDateListView,
    MealWeeklySummaryView,
)

urlpatterns = [
    # 認証系は今は使わないので、追加していなければ何も書かなくてOK
    # auth の行を入れるなら、実際に views にあるものだけを書くこと

    path("meals/", MealCreateView.as_view(), name="meal-create"),
    path("meals/today/", MealTodayListView.as_view(), name="meal-today-list"),
    path("meals/by-date/", MealByDateListView.as_view(), name="meal-by-date"),
    path("meals/weekly-summary/", MealWeeklySummaryView.as_view(), name="meal-weekly-summary"),
]
