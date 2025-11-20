"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "../auth.module.css";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        // バリデーションエラーを優先的に拾う
        const msg = data?.email?.[0] ?? data?.password?.[0] ?? data?.detail ?? "登録に失敗しました";

        setMessage(String(msg));
        return;
      }

      // 新規登録成功 → ログインページへ
      setMessage("アカウントを作成しました。ログインしてください。");
      window.location.href = "/auth/login";
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
        {/* ロゴ */}
        <div className={styles.logoCircle}>
          <span className={styles.logoLeaf}>🍃</span>
        </div>
        <div className={styles.appName}>FITFEAST</div>

        {/* タイトル */}
        <h1 className={styles.title}>新規登録</h1>
        <p className={styles.description}>
          メールアドレスとパスワードを入力してアカウントを作成します。
        </p>

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
            <span className={styles.passwordHint}>6文字以上</span>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "送信中..." : "アカウントを作成"}
          </button>
        </form>

        {/* メッセージ表示 */}
        {message && <div className={styles.message}>{message}</div>}

        {/* フッターリンク */}
        <div className={styles.footerText}>
          すでにアカウントをお持ちですか？
          <br />
          <Link href="/auth/login" className={styles.link}>
            ログインはこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
