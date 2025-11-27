"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./home.module.css";

//  API から返ってくる形に合わせた型
type Meal = {
  id: number;
  name: string;
  eatenAt: string; // Django の DateTimeField をそのまま文字列で受け取る
  calorie: number;
  tag: string;
};

export default function HomePage() {
  const router = useRouter();

  // 🔹 食事一覧と状態
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function handleLogout() {
    // いまはフロント側だけでログアウト
    router.push("/auth/login");
  }

  // 🔹 初回マウント時に今日の食事を取得
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/meals/today/`);
        if (!res.ok) {
          throw new Error("API error");
        }
        const data: Meal[] = await res.json();
        setMeals(data);
      } catch (e) {
        console.error(e);
        setError("今日の食事データを取得できませんでした。");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

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
          <span className={styles.dateLabel}>今日</span>
          <span className={styles.dateValue}>{todayLabel}</span>
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

        {/* 下段：食事一覧 */}
        <section className={styles.mealsSection}>
          <div className={styles.mealsHeader}>
            <h2 className={styles.sectionTitle}>今日の食事</h2>
            <button className={styles.addButton} onClick={() => router.push("/meals/new")}>
              ＋ 食事を記録する
            </button>
          </div>

          <div className={styles.mealsList}>
            {loading ? (
              <p className={styles.loading}>読み込み中...</p>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : meals.length === 0 ? (
              <p className={styles.emptyMessage}>
                まだ今日の食事は記録されていません。 「＋ 食事を記録する」から追加してみましょう。
              </p>
            ) : (
              meals.map((meal) => (
                <article key={meal.id} className={styles.mealCard}>
                  <div className={styles.mealInfo}>
                    <p className={styles.mealName}>{meal.name}</p>
                    <p className={styles.mealTime}>{formatDateTime(meal.eatenAt)}</p>
                  </div>
                  <div className={styles.mealMeta}>
                    <span className={styles.mealTag}>{meal.tag}</span>
                    <span className={styles.mealCalorie}>{meal.calorie} kcal</span>
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
