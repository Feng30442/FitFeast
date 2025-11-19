"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: email, // ← Django の標準は username なので email をそのまま使う
        password,
      }),
      credentials: "include", // ← Cookie を受け取るために重要
    });

    if (res.ok) {
      // ★ ログイン成功 → /home へ移動
      window.location.href = "/home";
    } else {
      alert("メールアドレスまたはパスワードが間違っています");
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* ここはあなたのデザインのままでOK */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          className={styles.input}
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className={styles.input}
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className={styles.button}>
          ログイン
        </button>
      </form>
    </div>
  );
}
