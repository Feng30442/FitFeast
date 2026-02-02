"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MealImageUploader from "./components/MealImageUploader";
import styles from "./edit.module.css";

type Meal = {
  id: number;
  name: string;
  eatenAt: string;
  calorie: number;
  tag: string;
  created_at: string;
  image_url: string | null;
};

export default function MealEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const mealId = Number(params.id);

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!mealId || Number.isNaN(mealId)) return;

    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) {
      setError("NEXT_PUBLIC_API_BASE_URL is not defined");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${base}/api/meals/${mealId}/`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();

        setMeal(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load meal";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [mealId]);

  const handleSubmit = async () => {
    if (!meal) return;

    setSaving(true);
    setError(null);

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!base) throw new Error("API base URL not defined");

      const res = await fetch(`${base}/api/meals/${meal.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: meal.name,
          tag: meal.tag,
          calorie: meal.calorie,
          eatenAt: meal.eatenAt,
        }),
      });

      if (!res.ok) throw new Error(`Update failed: ${res.status}`);

      router.push("/home");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update meal";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!meal) return <div className="p-6">Meal not found</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>Edit Meal</h1>
              <p className={styles.subtitle}>食事の内容と画像を編集できます</p>
            </div>

            <button className={styles.backBtn} onClick={() => router.push("/home")}>
              ← 戻る
            </button>
          </div>

          {/* 大图 */}
          <div className={styles.hero}>
            {meal?.image_url ? (
              <img src={meal.image_url} alt="" />
            ) : (
              <div className={styles.noImage}>No Image</div>
            )}
          </div>

          <div className={styles.grid}>
            {/* 左侧：缩略图 + 上传 */}
            <div className={styles.sideCard}>
              <p className={styles.sectionTitle}>画像</p>

              <MealImageUploader
                mealId={meal.id}
                imageUrl={meal.image_url}
                onUploaded={(updated) => {
                  const newUrl = "image_url" in updated ? updated.image_url : updated.imageUrl;

                  setMeal((prev) => (prev ? { ...prev, image_url: newUrl } : prev));
                }}
              />
            </div>

            {/* 右侧：表单 */}
            <div className={styles.formCard}>
              <p className={styles.sectionTitle}>基本情報</p>

              {/* 食事名 */}
              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>食事名</label>
                </div>
                <input
                  className={styles.input}
                  value={meal.name ?? ""}
                  onChange={(e) =>
                    setMeal((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                />
              </div>

              {/* 标签 */}
              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>タグ</label>
                  <span className={styles.chip}>編集</span>
                </div>
                <input
                  className={styles.input}
                  value={meal.tag ?? ""}
                  onChange={(e) =>
                    setMeal((prev) => (prev ? { ...prev, tag: e.target.value } : null))
                  }
                />
              </div>

              {/* 卡路里 */}
              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>カロリー (kcal)</label>
                </div>
                <input
                  className={styles.input}
                  type="number"
                  value={meal.calorie ?? 0}
                  onChange={(e) =>
                    setMeal((prev) =>
                      prev
                        ? {
                            ...prev,
                            calorie: Number(e.target.value),
                          }
                        : null,
                    )
                  }
                />
              </div>

              {/* 时间 */}
              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>食事日時</label>
                </div>
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={(meal.eatenAt ?? "").slice(0, 16)}
                  onChange={(e) =>
                    setMeal((prev) => (prev ? { ...prev, eatenAt: e.target.value } : null))
                  }
                />
                <p className={styles.helper}>表示の都合でローカル形式にしています</p>
              </div>

              <div className={styles.actions}>
                {/* 保存 */}
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  保存
                </button>

                {/* 删除 */}
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={async () => {
                    if (!confirm("この食事を削除しますか？")) return;

                    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
                    if (!base) {
                      alert("API base URL is not defined");
                      return;
                    }

                    const res = await fetch(`${base}/api/meals/${meal.id}/`, {
                      method: "DELETE",
                    });

                    if (!res.ok) {
                      alert(`削除に失敗しました (${res.status})`);
                      return;
                    }

                    router.push("/home");
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
