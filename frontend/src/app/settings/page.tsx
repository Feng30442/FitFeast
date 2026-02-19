"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

type Sex = "male" | "female";
type Activity = "sedentary" | "light" | "moderate" | "high" | "athlete";
type GoalMode = "maintain" | "cut" | "bulk";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function calcDailyKcal(params: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goalMode: GoalMode;
}) {
  const { sex, age, heightCm, weightKg, activity, goalMode } = params;

  // Mifflin-St Jeor
  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = sex === "male" ? bmrBase + 5 : bmrBase - 161;

  const factor =
    activity === "sedentary"
      ? 1.2
      : activity === "light"
        ? 1.375
        : activity === "moderate"
          ? 1.55
          : activity === "high"
            ? 1.725
            : 1.9;

  let tdee = bmr * factor;
  const adjust = goalMode === "cut" ? -400 : goalMode === "bulk" ? 250 : 0;
  tdee += adjust;

  return Math.round(clamp(tdee, 800, 5000));
}

export default function SettingsPage() {
  const router = useRouter();

  // 保存目标
  const [goal, setGoal] = useState<number>(1800);

  // 自动计算输入
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState<number>(20);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(60);
  const [activity, setActivity] = useState<Activity>("light");
  const [goalMode, setGoalMode] = useState<GoalMode>("maintain");

  // UI 状态
  const [toast, setToast] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 读取当前目标
  useEffect(() => {
    const t = localStorage.getItem("access_token");

    fetch(`${API_BASE}/api/profile/goal/`, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setGoal(Number(data.daily_calorie_goal ?? 1800));
      })
      .catch(() => {
        setHint("読み込みに失敗しました（ログインしてください）");
      });
  }, []);

  const suggested = useMemo(() => {
    if (!Number.isFinite(age) || !Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return 1800;
    if (age < 10 || age > 120) return 1800;
    if (heightCm < 120 || heightCm > 230) return 1800;
    if (weightKg < 30 || weightKg > 250) return 1800;

    return calcDailyKcal({ sex, age, heightCm, weightKg, activity, goalMode });
  }, [sex, age, heightCm, weightKg, activity, goalMode]);

  // BMI / BMR 表示（日系アプリっぽい）
  const bmi = useMemo(() => {
    const h = heightCm / 100;
    if (!h) return 0;
    return Math.round((weightKg / (h * h)) * 10) / 10;
  }, [heightCm, weightKg]);

  const bmr = useMemo(() => {
    const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
    const v = sex === "male" ? bmrBase + 5 : bmrBase - 161;
    return Math.round(v);
  }, [sex, age, heightCm, weightKg]);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2200);
  };

  const applySuggested = () => {
    setGoal(suggested);
    showToast("推奨値を目標に反映しました");
  };

  const handleSave = async () => {
    setHint(null);

    if (!Number.isFinite(goal)) {
      setHint("数値を入力してください");
      return;
    }
    if (goal < 800 || goal > 5000) {
      setHint("目標カロリーは 800〜5000 kcal の範囲で入力してください");
      return;
    }

    const t = localStorage.getItem("access_token");
    if (!t) {
      setHint("ログインが必要です");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile/goal/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ daily_calorie_goal: goal }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.log("PATCH status:", res.status, text);
        setHint("保存に失敗しました（入力内容をご確認ください）");
        return;
      }

      showToast("保存しました");
      // 好きなら保存後に戻す
      // router.push("/home");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Header（Homeと統一） */}
      <header className={styles.header}>
        <div className={styles.logoArea} onClick={() => router.push("/home")} role="button">
          <div className={styles.logoCircle}>
            <span className={styles.logoLeaf}>🍃</span>
          </div>
          <span className={styles.appName}>FITFEAST</span>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.backBtn} onClick={() => router.push("/home")}>
            ← ホーム
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {toast && <div className={styles.toast}>{toast}</div>}

        <div className={styles.titleRow}>
          <h1 className={styles.title}>目標カロリー設定</h1>
          <p className={styles.subtitle}>身体情報から推奨値を算出し、目標に反映できます。</p>
        </div>

        {/* 推奨値カード */}
        <section className={styles.grid2}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardTitle}>推奨（自動計算）</p>
              <span className={styles.badge}>おすすめ</span>
            </div>

            <div className={styles.bigNumber}>
              {suggested}
              <span className={styles.unit}>kcal / 日</span>
            </div>

            <div className={styles.miniStats}>
              <div className={styles.statItem}>
                <p className={styles.statLabel}>基礎代謝</p>
                <p className={styles.statValue}>{bmr} kcal</p>
              </div>
              <div className={styles.statItem}>
                <p className={styles.statLabel}>BMI</p>
                <p className={styles.statValue}>{bmi}</p>
              </div>
            </div>

            <button className={styles.primaryBtn} onClick={applySuggested}>
              推奨値を目標に反映
            </button>
            <p className={styles.note}>
              ※ 推奨値は Mifflin-St Jeor 式と活動係数から算出しています。
            </p>
          </div>

          {/* 目標値（保存） */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardTitle}>現在の目標</p>
            </div>

            <div className={styles.goalRow}>
              <input
                className={styles.goalInput}
                type="number"
                value={goal}
                min={800}
                max={5000}
                step={50}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") return;
                  setGoal(Number(v));
                }}
              />
              <span className={styles.goalUnit}>kcal</span>
            </div>
            <p className={styles.subText}>入力範囲：800〜5000 kcal</p>

            {hint && <div className={styles.hint}>{hint}</div>}

            <button className={styles.darkBtn} onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "保存する"}
            </button>
          </div>
        </section>

        {/* フォーム（日本アプリ風） */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>身体情報</p>
            <p className={styles.cardDesc}>入力すると推奨値が自動更新されます。</p>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>性別</label>
              <select className={styles.select} value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>年齢</label>
              <div className={styles.inputWithUnit}>
                <input className={styles.input} type="number" value={age} min={10} max={120} onChange={(e) => setAge(Number(e.target.value))} />
                <span className={styles.unitChip}>歳</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>身長</label>
              <div className={styles.inputWithUnit}>
                <input className={styles.input} type="number" value={heightCm} min={120} max={230} onChange={(e) => setHeightCm(Number(e.target.value))} />
                <span className={styles.unitChip}>cm</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>体重</label>
              <div className={styles.inputWithUnit}>
                <input className={styles.input} type="number" value={weightKg} min={30} max={250} onChange={(e) => setWeightKg(Number(e.target.value))} />
                <span className={styles.unitChip}>kg</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>活動レベル</label>
              <select className={styles.select} value={activity} onChange={(e) => setActivity(e.target.value as Activity)}>
                <option value="sedentary">ほとんど運動しない</option>
                <option value="light">週1〜3回</option>
                <option value="moderate">週3〜5回</option>
                <option value="high">ほぼ毎日</option>
                <option value="athlete">非常に活発</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>目的</label>
              <select className={styles.select} value={goalMode} onChange={(e) => setGoalMode(e.target.value as GoalMode)}>
                <option value="maintain">体重維持</option>
                <option value="cut">減量（-400kcal）</option>
                <option value="bulk">増量（+250kcal）</option>
              </select>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
