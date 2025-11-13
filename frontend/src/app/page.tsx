// src/app/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

/* ==========
   轻量 API 封装（无需额外文件）
========== */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "http://localhost:8000";

type Meal = {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  kcal: number;
  carb: number;
  prot: number;
  fat: number;
};
type MealsResp = { results: Meal[] };
type Goals = { daily: { cal: number; carb: number; prot: number; fat: number } };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

async function fetchMeals(): Promise<Meal[]> {
  const { results } = await api<MealsResp>("/api/meals");
  return results || [];
}
async function fetchGoals(): Promise<Goals> {
  return api<Goals>("/api/goals");
}

/* ==========
   小组件：数值卡片 & 圆环
========== */
function StatCard(props: { title: string; value: string; hint?: string; children?: React.ReactNode }) {
  const { title, value, hint, children } = props;
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {hint && <span className={styles.cardHint}>{hint}</span>}
      </div>
      <div className={styles.cardValue}>{value}</div>
      {children}
    </div>
  );
}

function ProgressRing(props: { value: number; max: number; label?: string }) {
  const { value, max, label } = props;
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className={styles.ringWrap}>
      <svg viewBox="0 0 100 100" className={styles.ringSvg} aria-label={label}>
        <circle cx="50" cy="50" r={r} className={styles.ringBg} />
        <circle
          cx="50"
          cy="50"
          r={r}
          className={styles.ringFg}
          strokeDasharray={`${dash} ${c - dash}`}
        />
        <text x="50" y="54" textAnchor="middle" className={styles.ringText}>
          {Math.round(pct)}%
        </text>
      </svg>
      {label && <div className={styles.ringLabel}>{label}</div>}
      <div className={styles.ringDetail}>
        <span>{Math.round(value)}</span> / <span>{max}</span>
      </div>
    </div>
  );
}

/* ==========
   页面本体
========== */
export default function DashboardPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [m, g] = await Promise.all([fetchMeals(), fetchGoals()]);
        setMeals(m);
        setGoals(g);
      } catch (e: any) {
        setErr(e?.message || "load failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todayMeals = useMemo(() => meals.filter((m) => m.date === today), [meals, today]);
  const sums = useMemo(
    () =>
      todayMeals.reduce(
        (a, m) => ({
          cal: a.cal + (m.kcal || 0),
          carb: a.carb + (m.carb || 0),
          prot: a.prot + (m.prot || 0),
          fat: a.fat + (m.fat || 0),
        }),
        { cal: 0, carb: 0, prot: 0, fat: 0 }
      ),
    [todayMeals]
  );

  if (loading) return <main className={styles.container}>読み込み中…</main>;
  if (err) return <main className={styles.container}>エラー: {err}</main>;
  if (!goals) return <main className={styles.container}>目標値が取得できませんでした。</main>;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>FitFeast ダッシュボード</h1>
        <p className={styles.subtitle}>今日（{today}）の摂取と目標</p>
      </header>

      <section className={styles.grid}>
        <StatCard title="今日の合計 kcal" value={`${sums.cal} kcal`} hint={`目標 ${goals.daily.cal} kcal`}>
          <ProgressRing value={sums.cal} max={goals.daily.cal} label="カロリー" />
        </StatCard>

        <StatCard title="炭水化物 (g)" value={`${Math.round(sums.carb)} g`} hint={`目標 ${goals.daily.carb} g`}>
          <ProgressRing value={sums.carb} max={goals.daily.carb} label="炭水化物" />
        </StatCard>

        <StatCard title="たんぱく質 (g)" value={`${Math.round(sums.prot)} g`} hint={`目標 ${goals.daily.prot} g`}>
          <ProgressRing value={sums.prot} max={goals.daily.prot} label="たんぱく質" />
        </StatCard>

        <StatCard title="脂質 (g)" value={`${Math.round(sums.fat)} g`} hint={`目標 ${goals.daily.fat} g`}>
          <ProgressRing value={sums.fat} max={goals.daily.fat} label="脂質" />
        </StatCard>
      </section>

      <nav className={styles.nav}>
        <Link className={styles.btn} href="/meals">🍱 食事を記録する</Link>
        <Link className={styles.btn} href="/analysis">📊 分析を見る</Link>
        <Link className={styles.btn} href="/goals">🎯 目標を編集</Link>
        <Link className={styles.btn} href="/profile">🙍‍♂️ プロフィール</Link>
      </nav>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>今日の食事（{todayMeals.length}件）</h2>
        {todayMeals.length === 0 ? (
          <div className={styles.empty}>まだ記録がありません。まずは「食事を記録する」から追加してください。</div>
        ) : (
          <ul className={styles.list}>
            {todayMeals.map((m) => (
              <li key={m.id} className={styles.listItem}>
                <div className={styles.mealName}>{m.name}</div>
                <div className={styles.mealMeta}>
                  <span>{m.kcal} kcal</span>
                  <span>C:{m.carb}g</span>
                  <span>P:{m.prot}g</span>
                  <span>F:{m.fat}g</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
