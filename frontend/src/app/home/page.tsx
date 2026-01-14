"use client";

import { useRouter } from "next/navigation";
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

  // 🔹 食事一覧と状態
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 追加：選択中の日付（入力用の "YYYY-MM-DD"）
  const [selectedDate, setSelectedDate] = useState("");

  // 🔹 追加：1週間のサマリ
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryItem[]>([]);

  function handleLogout() {
    // いまはフロント側だけでログアウト
    router.push("/auth/login");
  }

  // (初期データ取得はマウント時の別 useEffect で行う)

  // 🔹 今日の合計 / 残り
  const todayTotal = meals.reduce((sum, m) => sum + m.calorie, 0);
  const target = 1800;
  const remain = target - todayTotal;

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
    // 初期の選択日を今日にしておく（Hydration 対策で useEffect 内で決める）
    const todayStr = toDateInputValue(now);
    setSelectedDate(todayStr);
    // 今の日時（表示用）をセット
    setNowDateTime(formatDateTime(now.toISOString()));

    // 初回マウント時に選択日に合わせて食事を取得し、週次サマリも取得
    fetchMealsByDate(todayStr);
    fetchWeeklySummary();
  }, []);

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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/meals/by-date/?date=${dateStr}`,
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/meals/weekly-summary/`);
      if (!res.ok) throw new Error("API error");
      const data: WeeklySummaryItem[] = await res.json();
      setWeeklySummary(data);
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
          <button className={styles.logoutButton} onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </header>

      {/* メイン */}
      <main className={styles.main}>
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
              今日は脂質を少し控えめにして、 野菜をもう一品追加してみましょう 🌿
            </p>
          </div>
        </section>

        <WeeklyChart weeklySummary={weeklySummary} />

        <section className={styles.mealsSection}>
          <div className={styles.mealsHeader}>
            <h2 className={styles.sectionTitle}>食事一覧</h2>

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

                    {/* ✅ 編集へ */}
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
