"use client";

import { useState } from "react";
import { uploadMealImage } from "@/lib/api/meals"; // 你放 API 的地方

type Props = {
  mealId: number;
  imageUrl: string | null;
  onUploaded: (updated: { id: number; imageUrl: string }) => void;
};

export default function MealImageUploader({
  mealId,
  imageUrl,
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex gap-4 items-center">
      <div className="h-28 w-28 rounded-lg bg-gray-200 overflow-hidden grid place-items-center">
        {preview || imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview ?? imageUrl ?? ""}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-gray-500">No Image</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
        />

        <button
          disabled={!file || loading}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          onClick={async () => {
            if (!file) return;
            setLoading(true);
            try {
              const updated = await uploadMealImage(mealId, file);
              onUploaded(updated);
              setFile(null);
              setPreview(null);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
