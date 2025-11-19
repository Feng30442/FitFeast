// src/app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // ルートに来たら /home へ（認証は middleware がチェック）
  redirect("/home");
}
