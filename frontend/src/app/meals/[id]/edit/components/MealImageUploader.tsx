"use client";

import { uploadMealImage } from "@/lib/api/meals";
import { useEffect, useState } from "react";
import styles from "./MealImageUploader.module.css";

type Uploaded =
  | { id: number; imageUrl: string } // 前端自定义返回
  | { id: number; image_url: string }; // Django serializer 常见返回

type Props = {
  mealId: number;
  imageUrl: string | null; // 现在数据库里已有的图片URL
  onUploaded: (updated: Uploaded) => void;
};

export default function MealImageUploader({ mealId, imageUrl, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 选择文件 => 生成预览
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);

    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const updated = await uploadMealImage(mealId, file);
      onUploaded(updated);

      // 清理
      setFile(null);
      setPreviewUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const shownImage = previewUrl ?? imageUrl;

  return (
    <div className={styles.wrap}>
      <div className={styles.thumb}>
        {shownImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownImage} alt="meal image" className={styles.thumbImg} />
        ) : (
          <span className={styles.noImage}>No Image</span>
        )}
      </div>

      <div className={styles.row}>
        <label className={styles.fileBtn}>
          📷 画像を選択
          <input
            className={styles.hiddenInput}
            type="file"
            accept="image/*"
            onChange={onPickFile}
            disabled={loading}
          />
        </label>

        <span className={styles.fileName}>{file ? file.name : "アップロードしました"}</span>

        <button
          type="button"
          className={styles.uploadBtn}
          disabled={!file || loading}
          onClick={onUpload}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <p className={styles.note}>※ JPG / PNG 推奨。アップロード後すぐ反映されます。</p>
    </div>
  );
}
