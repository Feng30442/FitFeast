"use client";

import { Button } from "@/app/sample/_components/Button/Button";
import { Input } from "@/app/sample/_components/Input/Input";
import styles from "@/app/sample/page.module.css";
import { authSignin } from "@/lib/api/auth/signin";
import { authUser } from "@/lib/api/auth/user";
import { SigninErrorResponse } from "@/types/api/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

const Signin = () => {
  const router = useRouter();

  const [signinInfo, setSigninInfo] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<SigninErrorResponse>();

  const handleOnChangeSignin = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSigninInfo((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSignin = useCallback(async () => {
    setErrors(undefined);
    const signinResult = await authSignin(signinInfo);
    console.log(signinResult);
    if (!signinResult.success) {
      setErrors({ message: signinResult.data.message });
      return signinResult.data?.message;
    }
    const userResult = await authUser();
    console.log(userResult);

    if (!userResult.success) {
      return alert(userResult.data?.message);
    }

    router.push("/home");
  }, [signinInfo, router]);

  return (
    <div className={styles.content}>
      <fieldset className={styles.fieldset}>
        <legend>サインインを行うユーザ情報を入力</legend>
        <div className={styles.form}>
          <span>{errors?.message}</span>
          <p>
            <label>
              ユーザー名:
              <Input
                name="username"
                value={signinInfo.username}
                onChange={handleOnChangeSignin}
                type="text"
              />
            </label>
          </p>
          <p>
            <label>
              パスワード:
              <Input
                name="password"
                value={signinInfo.password}
                onChange={handleOnChangeSignin}
                type="password"
              />
            </label>
          </p>
        </div>
        <Button type="button" className={styles.button} onClick={handleSignin}>
          サインイン
        </Button>
        <p>
          <span>
            アカウントをお持ちでない方は
            <Link href="/signup">こちらからサインアップ</Link>
          </span>
        </p>
      </fieldset>
    </div>
  );
};

export default Signin;
