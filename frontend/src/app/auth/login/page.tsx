"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // backend で {"detail": "..."} を返している場合を想定
        setMessage(data.detail ?? "ログインに失敗しました");
        return;
      }

      // token 保存（简易版：localStorage）
      localStorage.setItem("token", data.token);

      setMessage("ログイン成功！");
      // TODO: ここでホーム画面などへ遷移
      // window.location.href = "/"; など
    } catch (err) {
      console.error(err);
      setMessage("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>ログイン</h1>
        <p className={styles.description}>
          登録済みのメールアドレスとパスワードを入力してください。
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <div className={styles.label}>メールアドレス</div>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div>
            <div className={styles.label}>パスワード</div>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "送信中..." : "ログイン"}
          </button>
        </form>

        {message && <div className={styles.message}>{message}</div>}

        <div className={styles.linkRow}>
          アカウントをお持ちでないですか？{" "}
          <Link href="/auth/signup" className={styles.link}>
            新規登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
