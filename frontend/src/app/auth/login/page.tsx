"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // backend が email / password を受け取る想定
        body: JSON.stringify({ email, password }),
        credentials: "include", // Cookie を受け取る
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage(data?.detail ?? "メールアドレスまたはパスワードが正しくありません");
        return;
      }

      // ログイン成功 → /home へ
      window.location.href = "/home";
    } catch (err) {
      console.error(err);
      setMessage("サーバーへの接続に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* ロゴ部分 */}
        <div className={styles.logoCircle}>
          <span className={styles.logoLeaf}>🍃</span>
        </div>
        <div className={styles.appName}>FITFEAST</div>

        {/* タイトル */}
        <h1 className={styles.title}>ログイン</h1>
        <p className={styles.description}>登録済みのメールアドレスとパスワードを入力してください</p>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            className={styles.input}
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className={styles.passwordWrapper}>
            <input
              type="password"
              className={styles.input}
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className={styles.passwordHint}>8文字以上</span>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "送信中..." : "ログイン"}
          </button>
        </form>

        {message && <div className={styles.message}>{message}</div>}

        {/* 新規登録リンク */}
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
