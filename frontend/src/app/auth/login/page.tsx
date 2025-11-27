"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message] = useState<string | null>(null);
  const [loading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 開発中はサーバーに投げず、そのままホームへ遷移するだけにする
    // もし簡単なバリデーションをしたければここでチェックしてもOK
    router.push("/home");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logoCircle}>
          <span className={styles.logoLeaf}>🍃</span>
        </div>
        <div className={styles.appName}>FITFEAST</div>

        <h1 className={styles.title}>ログイン</h1>
        <p className={styles.description}>登録済みのメールアドレスとパスワードを入力してください</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            className={styles.input}
            placeholder="メールアドレス"
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
