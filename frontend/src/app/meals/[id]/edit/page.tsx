"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import MealImageUploader from "./components/MealImageUploader";

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
  const mealId = Number(params.id);

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // ✅ ここは「単体取得API」が必要
        // まだ無い場合は下で代替案を書くので安心して
        const res = await fetch(`${base}/meals/${mealId}/`);
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!meal) return <div className="p-6">Meal not found</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Edit Meal</h1>

      <MealImageUploader
        mealId={meal.id}
        imageUrl={meal.image_url}
        onUploaded={(updated) => setMeal(updated)}
      />

      {/* ここに他の編集フォームを追加していく */}
      <div className="text-sm text-gray-600">
        <div>name: {meal.name}</div>
        <div>tag: {meal.tag}</div>
        <div>calorie: {meal.calorie}</div>
        <div>eatenAt: {meal.eatenAt}</div>
      </div>
    </div>
  );
}
