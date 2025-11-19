"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/signup/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        // Django 側が {"email": ["すでに登録されています"]} を返すかもしれない
        if (data?.email?.[0]) {
          setMessage(String(data.email[0]));
        } else {
          setMessage("登録に失敗しました");
        }
        return;
      }

      // 登録成功 → そのままログイン状態として /home へ
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
        <div className={styles.logoCircle}>
          <span className={styles.logoLeaf}>🍃</span>
        </div>
        <div className={styles.appName}>FITFEAST</div>

        <h1 className={styles.title}>新規登録</h1>
        <p className={styles.description}>
          メールアドレスとパスワードを入力してアカウントを作成します。
        </p>

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

        {message && <div className={styles.message}>{message}</div>}

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
