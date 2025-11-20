// src/app/home/page.tsx
import styles from "./home.module.css";

type Meal = {
  id: number;
  name: string;
  time: string;
  calorie: number;
  tag: string;
};

const dummyMeals: Meal[] = [
  {
    id: 1,
    name: "グリルチキンサラダ",
    time: "08:30 朝食",
    calorie: 380,
    tag: "ヘルシー",
  },
  {
    id: 2,
    name: "サーモンと雑穀ごはん",
    time: "12:20 昼食",
    calorie: 620,
    tag: "バランス",
  },
  {
    id: 3,
    name: "ヨーグルト＆フルーツ",
    time: "16:00 間食",
    calorie: 180,
    tag: "ライト",
  },
];

export default function HomePage() {
  const todayTotal = dummyMeals.reduce((sum, m) => sum + m.calorie, 0);
  const target = 1800;
  const remain = target - todayTotal;

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
          <button className={styles.logoutButton}>ログアウト</button>
        </div>
      </header>

      {/* メイン */}
      <main className={styles.main}>
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
              今日は脂質を少し控えめにして、
              野菜をもう一品追加してみましょう 🌿
            </p>
          </div>
        </section>

        {/* 下段：食事一覧 */}
        <section className={styles.mealsSection}>
          <div className={styles.mealsHeader}>
            <h2 className={styles.sectionTitle}>今日の食事</h2>
            <button className={styles.addButton}>＋ 食事を記録する</button>
          </div>

          <div className={styles.mealsList}>
            {dummyMeals.map((meal) => (
              <article key={meal.id} className={styles.mealCard}>
                <div className={styles.mealInfo}>
                  <p className={styles.mealName}>{meal.name}</p>
                  <p className={styles.mealTime}>{meal.time}</p>
                </div>
                <div className={styles.mealMeta}>
                  <span className={styles.mealTag}>{meal.tag}</span>
                  <span className={styles.mealCalorie}>
                    {meal.calorie} kcal
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
