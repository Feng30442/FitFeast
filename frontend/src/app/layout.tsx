// src/app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "FITFEAST",
  description: "健康料理 × AI の食事管理アプリ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja"data-cursorstyle="true"                       data-effect-ective="true"
    >
      <body>{children}</body>
    </html>
  );
}
