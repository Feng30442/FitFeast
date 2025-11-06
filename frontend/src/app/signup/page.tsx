"use client";

import { Button } from "@/app/sample/_components/Button/Button";
import { Input } from "@/app/sample/_components/Input/Input";
import styles from "@/app/sample/page.module.css";
import { authSignup } from "@/lib/api/auth/signup";
import { SignupValidateErrors } from "@/types/api/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { z } from "zod";

const Signup = () => {
  const router = useRouter();

  const [signupInput, setSignupInput] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<SignupValidateErrors>();

  const handleOnChangeSignup = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupInput((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSignup = useCallback(async () => {
    console.log(signupInput);

    const signupSchema = z.object({
      username: z
        .string()
        .nonempty("ユーザーIDは必須です。")
        .regex(/^[a-zA-Z0-9]+$/, "ユーザーIDは英数字のみ使用できます。")
        .max(20, "ユーザーIDは20文字以内で入力してください。"),
      password: z
        .string()
        .nonempty("パスワードは必須です。")
        .regex(/^[a-zA-Z0-9]+$/, "パスワードは英数字のみ使用できます。")
        .min(8, "パスワードは8文字以上20文字以内で入力してください")
        .max(20, "パスワードは8文字以上20文字以内で入力してください"),
    });

    const validatedSignupResult = signupSchema.safeParse(signupInput);

    if (!validatedSignupResult.success) {
      const fieldErrors = z.treeifyError(validatedSignupResult.error).properties;
      setErrors({
        username: fieldErrors?.username?.errors[0],
        password: fieldErrors?.password?.errors[0],
      });
      return;
    }
    setErrors(undefined);

    const result = await authSignup(signupInput);
    console.log(result);

    if (!result.success) {
      return alert("登録に失敗しました。入力内容をご確認ください。");
    }

    setSignupInput({
      username: "",
      password: "",
    });
    router.push("/signin");
  }, [signupInput, router]);

  return (
    <div className={styles.content}>
      <fieldset className={styles.fieldset}>
        <legend>サインアップするユーザ情報を入力</legend>
        <div className={styles.form}>
          <p>
            <label>
              ユーザー名:
              <Input
                name="username"
                value={signupInput.username}
                onChange={handleOnChangeSignup}
                type="text"
              />
            </label>
            <br />
            <span>{errors?.username}</span>
          </p>
          <p>
            <label>
              パスワード:
              <Input
                name="password"
                value={signupInput.password}
                onChange={handleOnChangeSignup}
                type="password"
              />
            </label>
            <br />
            <span>{errors?.password}</span>
          </p>
        </div>
        <Button type="button" className={styles.button} onClick={handleSignup}>
          サインアップ
        </Button>
        <p>
          <span>
            既にアカウントをお持ちの方は
            <Link href="/signin">こちらからサインイン</Link>
          </span>
        </p>
      </fieldset>
    </div>
  );
};

export default Signup;
