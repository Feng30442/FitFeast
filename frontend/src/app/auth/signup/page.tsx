"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "../auth.module.css";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // serializer のエラーなど {"email": [...], "password": [...]} を想定
        if (data.email?.[0]) {
          setMessage(String(data.email[0]));
        } else if (data.password?.[0]) {
          setMessage(String(data.password[0]));
        } else {
          setMessage("登録に失敗しました");
        }
        return;
      }

      // token 保存
      localStorage.setItem("token", data.token);

      setMessage("登録が完了しました！");
      // TODO: 登録後にログインページ or ホームに飛ばす
      // window.location.href = "/auth/login"; など
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
        <h1 className={styles.title}>新規登録</h1>
        <p className={styles.description}>
          メールアドレスとパスワードを入力してアカウントを作成します。
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
            {loading ? "送信中..." : "アカウントを作成"}
          </button>
        </form>

        {message && <div className={styles.message}>{message}</div>}

        <div className={styles.linkRow}>
          すでにアカウントをお持ちですか？{" "}
          <Link href="/auth/login" className={styles.link}>
            ログインはこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
