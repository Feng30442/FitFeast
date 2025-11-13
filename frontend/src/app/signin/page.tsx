"use client";

import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Dashboard() {
  // 模拟假数据
  const goals = { cal: 2000, carb: 260, prot: 100, fat: 55 };
  const today = { cal: 1680, carb: 220, prot: 86, fat: 42 };
  const todayDate = new Date().toISOString().slice(0, 10);

  function pct(v: number, max: number) {
    return Math.round((v / max) * 100);
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>FitFeast ダッシュボード</h1>
        <p>今日 ({todayDate}) の摂取と目標</p>
      </header>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h3>カロリー</h3>
          <p>{today.cal} / {goals.cal} kcal</p>
          <div className={styles.progress}>
            <div style={{ width: `${pct(today.cal, goals.cal)}%` }}></div>
          </div>
        </div>

        <div className={styles.card}>
          <h3>炭水化物</h3>
          <p>{today.carb} / {goals.carb} g</p>
          <div className={styles.progress}>
            <div style={{ width: `${pct(today.carb, goals.carb)}%` }}></div>
          </div>
        </div>

        <div className={styles.card}>
          <h3>たんぱく質</h3>
          <p>{today.prot} / {goals.prot} g</p>
          <div className={styles.progress}>
            <div style={{ width: `${pct(today.prot, goals.prot)}%` }}></div>
          </div>
        </div>

        <div className={styles.card}>
          <h3>脂質</h3>
          <p>{today.fat} / {goals.fat} g</p>
          <div className={styles.progress}>
            <div style={{ width: `${pct(today.fat, goals.fat)}%` }}></div>
          </div>
        </div>
      </section>

      <nav className={styles.nav}>
        <Link className={styles.btn} href="#">🍱 食事を記録</Link>
        <Link className={styles.btn} href="#">📊 分析</Link>
        <Link className={styles.btn} href="#">🎯 目標設定</Link>
        <Link className={styles.btn} href="#">🙍‍♂️ プロフィール</Link>
      </nav>
    </main>
  );
}
