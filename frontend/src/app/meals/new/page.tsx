// src/app/meals/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type MealFormState = {
  name: string;
  eatenAt: string; // datetime-local の値（"2025-11-20T08:30" など）
  calorie: string; // 入力は文字列で持って、送信時に number に変換
  tag: string;
};

type FormErrorState = {
  name?: string;
  eatenAt?: string;
  calorie?: string;
  tag?: string;
  general?: string;
};

export default function MealCreatePage() {
  const router = useRouter();

  const [form, setForm] = useState<MealFormState>({
    name: "",
    eatenAt: "",
    calorie: "",
    tag: "ヘルシー",
  });

  const [errors, setErrors] = useState<FormErrorState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 入力値変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // 対応するエラーをクリア
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  // 簡単なバリデーション
  const validate = (values: MealFormState): FormErrorState => {
    const newErrors: FormErrorState = {};

    if (!values.name.trim()) {
      newErrors.name = "食事名を入力してください。";
    }

    if (!values.eatenAt) {
      newErrors.eatenAt = "食事日時を入力してください。";
    }

    if (!values.calorie) {
      newErrors.calorie = "カロリーを入力してください。";
    } else {
      const num = Number(values.calorie);
      if (Number.isNaN(num) || num <= 0) {
        newErrors.calorie = "カロリーは 1 以上の数値で入力してください。";
      }
    }

    if (!values.tag) {
      newErrors.tag = "タグを選択してください。";
    }

    return newErrors;
  };

  // 送信処理
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/meals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 認証いったん外してるので credentials はあってもなくてもOK
        body: JSON.stringify({
          name: form.name.trim(),
          eatenAt: form.eatenAt, // datetime-local の値
          calorie: Number(form.calorie),
          tag: form.tag,
        }),
      });

      if (!res.ok) {
        // API からのエラーメッセージがあれば拾う
        let message = "登録に失敗しました。時間をおいて再度お試しください。";
        try {
          const data = await res.json();
          if (data?.message) {
            message = data.message;
          }
        } catch {
          // JSON でない場合はそのままデフォルトメッセージ
        }
        setErrors({ general: message });
        setIsSubmitting(false);
        return;
      }

      // 成功したらホームへ遷移
      // 例：一覧ページが /home の場合
      router.push("/home");
    } catch (error) {
      console.error(error);
      setErrors({
        general: "通信エラーが発生しました。ネットワーク環境を確認してください。",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>食事を登録</h1>
        <p className={styles.description}>その日の食事内容とカロリーを記録しましょう。</p>

        {errors.general && <div className={styles.errorGeneral}>{errors.general}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* 食事名 */}
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              食事名 <span className={styles.required}>必須</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              placeholder="例）グリルチキンサラダ"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </div>

          {/* 食事日時 */}
          <div className={styles.field}>
            <label htmlFor="eatenAt" className={styles.label}>
              食事日時 <span className={styles.required}>必須</span>
            </label>
            <input
              id="eatenAt"
              name="eatenAt"
              type="datetime-local"
              className={`${styles.input} ${errors.eatenAt ? styles.inputError : ""}`}
              value={form.eatenAt}
              onChange={handleChange}
            />
            {errors.eatenAt && <p className={styles.error}>{errors.eatenAt}</p>}
          </div>

          {/* カロリー */}
          <div className={styles.field}>
            <label htmlFor="calorie" className={styles.label}>
              カロリー (kcal) <span className={styles.required}>必須</span>
            </label>
            <input
              id="calorie"
              name="calorie"
              type="number"
              min={0}
              step={1}
              className={`${styles.input} ${errors.calorie ? styles.inputError : ""}`}
              placeholder="例）380"
              value={form.calorie}
              onChange={handleChange}
            />
            {errors.calorie && <p className={styles.error}>{errors.calorie}</p>}
          </div>

          {/* タグ */}
          <div className={styles.field}>
            <label htmlFor="tag" className={styles.label}>
              タグ <span className={styles.required}>必須</span>
            </label>
            <select
              id="tag"
              name="tag"
              className={`${styles.select} ${errors.tag ? styles.inputError : ""}`}
              value={form.tag}
              onChange={handleChange}
            >
              <option value="ヘルシー">ヘルシー</option>
              <option value="高タンパク">高タンパク</option>
              <option value="糖質控えめ">糖質控えめ</option>
              <option value="ご褒美">ご褒美</option>
              <option value="外食">外食</option>
            </select>
            {errors.tag && <p className={styles.error}>{errors.tag}</p>}
          </div>

          {/* ボタン */}
          <div className={styles.actions}>
            {/* 戻るボタン */}
            <button type="button" className={styles.backButton} onClick={() => router.back()}>
              戻る
            </button>

            {/* 登録ボタン */}
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "登録する"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
