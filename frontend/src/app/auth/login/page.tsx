"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState(""); // いったん username として使う
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,     // ← username
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("ログイン失敗：IDまたはパスワードが違います");
        return;
      }

      // ✅ JWT保存
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      router.push("/home");
    } catch (err) {
      console.error(err);
      setMessage("通信エラー：サーバーに接続できません");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logoCircle}>
          <span className={styles.logoLeaf}>🍃</span>
        </div>
        <div className={styles.appName}>FITFEAST</div>

        <h1 className={styles.title}>ログイン</h1>
        <p className={styles.description}>
          登録済みのユーザー名（いまはメール欄に入力）とパスワードを入力してください
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            className={styles.input}
            placeholder="ユーザー名"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className={styles.input}
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "送信中..." : "ログイン"}
          </button>
        </form>

        {message && <div className={styles.message}>{message}</div>}

        <div className={styles.footerText}>
          アカウントをお持ちでないですか？
          <br />
          <Link href="/auth/signup" className={styles.link}>
            新規登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
