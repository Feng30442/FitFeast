"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import WeeklyChart from "./components/WeeklyChart";
import styles from "./home.module.css";

//  API から返ってくる形に合わせた型
type Meal = {
  id: number;
  name: string;
  eatenAt: string; // Django の DateTimeField をそのまま文字列で受け取る
  calorie: number;
  tag: string;
  image_url: string | null;
};

type WeeklySummaryItem = {
  date: string; // "2025-11-27"
  totalCalorie: number;
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔹 食事一覧と状態
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 追加：選択中の日付（入力用の "YYYY-MM-DD"）
  const [selectedDate, setSelectedDate] = useState("");

  // 🔹 追加：1週間のサマリ
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  function handleLogout() {
    // いまはフロント側だけでログアウト
    router.push("/auth/login");
  }

  // (初期データ取得はマウント時の別 useEffect で行う)

  // 🔹 今日の合計 / 残り
  const [target, setTarget] = useState<number>(1800);
  const todayTotal = meals.reduce((sum, m) => sum + m.calorie, 0);
  const remain = target - todayTotal;

  const progress = Math.min(100, Math.max(0, Math.round((todayTotal / target) * 100)));

  // 🔹 今日の日付（クライアントでマウント後に計算）
  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    const now = new Date();
    const label = now.toLocaleDateString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    });
    setTodayLabel(label);

    const queryDate = searchParams.get("date");
    const initDate = queryDate ?? toDateInputValue(now);

    setSelectedDate(initDate);
    setNowDateTime(formatDateTime(now.toISOString()));

    fetchMealsByDate(initDate);
    fetchWeeklySummary();
    fetchGoal();

    if (queryDate) {
      // URL をクリーンにして、次回は必ず「今日」に戻す
      router.replace("/home");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // toast from query (e.g. after registering)
  useEffect(() => {
    const toastType = searchParams.get("toast");
    const date = searchParams.get("date");

    if (toastType === "registered") {
      setToast(`${(date ?? "").replaceAll("-", "/")} の食事を登録しました 🍽️`);
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  // eaten_at を「HH:MM 朝食」みたいな表示に変換したい場合のヘルパー
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  function formatDateTime(dt: string) {
    const date = new Date(dt);

    return date.toLocaleString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // input[type=date] 用 "YYYY-MM-DD" 文字列を作る
  const toDateInputValue = (d: Date) => d.toISOString().slice(0, 10);

  //  現在の日時表示（例: "11/27(木) 08:53"）
  const [nowDateTime, setNowDateTime] = useState("");

  async function fetchMealsByDate(dateStr: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/meals/by-date/?date=${dateStr}`,
      );
      if (!res.ok) throw new Error("API error");
      const data: Meal[] = await res.json();
      setMeals(data);
    } catch (e) {
      console.error(e);
      setError("食事データを取得できませんでした。");
    } finally {
      setLoading(false);
    }
  }

  // 週次サマリ取得
  async function fetchWeeklySummary() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/meals/weekly-summary/`);
      if (!res.ok) throw new Error("API error");
      const data: WeeklySummaryItem[] = await res.json();
      setWeeklySummary(data);
    } catch (e) {
      console.error(e);
    }
  }

  // 目標カロリー取得
  async function fetchGoal() {
    try {
      const token = localStorage.getItem("access_token");
      console.log("access_token:", token); // ★ まずここ重要

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile/goal/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const text = await res.text();
        console.log("goal status:", res.status);
        console.log("goal body:", text);
        throw new Error("goal api error");
      }

      const data = await res.json();
      setTarget(data.daily_calorie_goal ?? 1800);
    } catch (e) {
      console.error(e);
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedDate(value);
    if (value) {
      fetchMealsByDate(value);
    }
  };

  // ② 最近 3 条记录
  const recentMeals = meals
    .slice()
    .sort((a, b) => new Date(b.eatenAt).getTime() - new Date(a.eatenAt).getTime())
    .slice(0, 3);

  // ③ 本周最高/平均
  const weekTotals = weeklySummary.map((w) => w.totalCalorie);
  const weekMax = weekTotals.length ? Math.max(...weekTotals) : 0;
  const weekAvg = weekTotals.length
    ? Math.round(weekTotals.reduce((s, n) => s + n, 0) / weekTotals.length)
    : 0;

  function getAiMessage(todayTotal: number, target: number, mealsCount: number) {
    if (mealsCount === 0) return "まだ食事が登録されていません。まずは1食から記録してみましょう 🍽️";
    if (todayTotal < target * 0.5)
      return `いい調子です！あと${target - todayTotal}kcal目安で、バランス良くいきましょう 🌿`;
    if (todayTotal <= target) return "順調です！タンパク質＋野菜を意識するとさらに良いですよ 💪";
    return "今日は少しオーバー気味。次の食事は野菜多め・揚げ物控えめで調整しましょう 🥗";
  }

  return (
    <div className={styles.wrapper}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <div className={styles.logoCircle}>
            <span className={styles.logoLeaf}>🍃</span>
          </div>
          <span className={styles.appName}>FITFEAST</span>
        </div>

        <div className={styles.userArea}>
          <span className={styles.userName}>こんにちは、ユーザーさん</span>
          <button className={styles.logoutButton} onClick={() => router.push("/settings")}>
            ⚙️ 目標設定
          </button>
          <button className={styles.logoutButton} onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </header>

      {/* メイン */}
      <main className={styles.main}>
        {toast && <div className={styles.toast}>{toast}</div>}
        {/* 日付表示 */}
        <div className={styles.dateRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className={styles.dateLabel}>今日</span>
            <span className={styles.dateValue}>{todayLabel}</span>
          </div>
        </div>

        {/* 上段：サマリー */}
        <section className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>今日の摂取カロリー</p>
            <p className={styles.summaryValue}>{todayTotal} kcal</p>
            <p className={styles.summarySub}>目標 {target} kcal</p>
          </div>

          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>残りの目安</p>
            <p className={styles.summaryValue}>
              {remain >= 0 ? `${remain} kcal` : `+${Math.abs(remain)} kcal`}
            </p>
            <p className={styles.summarySub}>
              {remain >= 0 ? "まだ余裕があります" : "今日は少し食べ過ぎかも…"}
            </p>
          </div>

          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>AI からの一言</p>
            <p className={styles.summaryMessage}>
              {getAiMessage(todayTotal, target, meals.length)}
            </p>
          </div>
        </section>

        {/* ✅ 今日进度 + 今週サマリ + 最近の食事 */}
        <section className={styles.insightsSection}>
          {/* 今日の進捗 */}
          <div className={styles.insightCard}>
            <div className={styles.insightHeader}>
              <p className={styles.insightTitle}>今日の進捗</p>
              <p className={styles.insightValue}>{progress}%</p>
            </div>

            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <p className={styles.insightSub}>
              {todayTotal} / {target} kcal（残り {remain >= 0 ? remain : `+${Math.abs(remain)}`}{" "}
              kcal）
            </p>
          </div>

          {/* 今週の統計 */}
          <div className={styles.insightCard}>
            <p className={styles.insightTitle}>今週のサマリ</p>
            <div className={styles.weekGrid}>
              <div className={styles.weekItem}>
                <p className={styles.weekLabel}>平均</p>
                <p className={styles.weekNumber}>{weekAvg} kcal</p>
              </div>
              <div className={styles.weekItem}>
                <p className={styles.weekLabel}>最高</p>
                <p className={styles.weekNumber}>{weekMax} kcal</p>
              </div>
            </div>
            <p className={styles.insightSub}>直近7日間の合計カロリーから計算しています。</p>
          </div>

          {/* 最近の食事 */}
          <div className={styles.insightCard}>
            <p className={styles.insightTitle}>最近の食事（最新3件）</p>

            {recentMeals.length === 0 ? (
              <p className={styles.insightSub}>まだ食事がありません。</p>
            ) : (
              <div className={styles.recentList}>
                {recentMeals.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={styles.recentItem}
                    onClick={() => router.push(`/meals/${m.id}/edit`)}
                  >
                    <div className={styles.recentLeft}>
                      <p className={styles.recentName}>{m.name}</p>
                      <p className={styles.recentTime}>{formatDateTime(m.eatenAt)}</p>
                    </div>
                    <div className={styles.recentRight}>
                      <span className={styles.recentKcal}>{m.calorie} kcal</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.chartCard}>
          <div className={styles.chartBox}>
            <WeeklyChart weeklySummary={weeklySummary} />
          </div>
        </section>

        <section className={styles.mealsSection}>
          <div className={styles.mealsHeader}>
            <div className={styles.titleRow}>
              <h2 className={styles.sectionTitle}>食事一覧</h2>
              <span className={styles.showingDate}>
                現在表示：{selectedDate ? selectedDate.replaceAll("-", "/") : "—"}
              </span>
            </div>

            {/* 日付切り替え */}
            <div className={styles.dateSelector}>
              <label className={styles.dateSelectorLabel}>
                日付
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className={styles.dateInput}
                />
              </label>
              <button className={styles.addButton} onClick={() => router.push("/meals/new")}>
                ＋ 食事を記録する
              </button>
            </div>
          </div>

          {/* 以下、meals のリスト表示 */}
          <div className={styles.mealsList}>
            {loading ? (
              <p className={styles.loading}>読み込み中...</p>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : meals.length === 0 ? (
              <p className={styles.emptyMessage}>この日には食事が登録されていません。</p>
            ) : (
              meals.map((meal) => (
                <article key={meal.id} className={styles.mealCard}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {/* ✅ 画像 */}
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        overflow: "hidden",
                        background: "#e5e7eb",
                      }}
                    >
                      {meal.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={meal.image_url}
                          alt={meal.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "grid",
                            placeItems: "center",
                            fontSize: 10,
                            color: "#6b7280",
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </div>

                    {/* 既存情報 */}
                    <div className={styles.mealInfo}>
                      <p className={styles.mealName}>{meal.name}</p>
                      <p className={styles.mealTime}>{formatDateTime(meal.eatenAt)}</p>
                    </div>
                  </div>

                  <div className={styles.mealMeta}>
                    <span className={styles.mealTag}>{meal.tag}</span>
                    <span className={styles.mealCalorie}>{meal.calorie} kcal</span>
                    <button
                      className={styles.editButton}
                      onClick={() => router.push(`/meals/${meal.id}/edit`)}
                    >
                      編集
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
