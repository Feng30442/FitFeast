"use client";

import { SignupValidateErrors } from "@/types/api/auth";
// import { validateSignupForm } from "@/app/utils/validation";
import { authSignin } from "@/lib/api/auth/signin";
import { authSignup } from "@/lib/api/auth/signup";
import { authUser } from "@/lib/api/auth/user";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { Button } from "./_components/Button/Button";
import { Input } from "./_components/Input/Input";
import styles from "./page.module.css";

const Sample = () => {
  const router = useRouter();

  const [signupInfo, setSignupInfo] = useState({
    username: "",
    password: "",
  });

  const [signinInfo, setSigninInfo] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<SignupValidateErrors>();

  const handleOnChangeSignup = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleOnChangeSignin = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSigninInfo((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSignup = useCallback(async () => {
    console.log(signupInfo);

    // const validationErrors = validateSignupForm(signupInfo);
    // const hasErrors = Object.values(validationErrors).some((message) => message !== "");

    // if (hasErrors) {
    //   setErrors(validationErrors);
    //   return;
    // }
    // setErrors(undefined);

    const result = await authSignup(signupInfo);
    console.log(result);

    if (!result.success) {
      return alert("登録に失敗しました。入力内容をご確認ください。");
    }

    setSignupInfo({
      username: "",
      password: "",
    });
  }, [signupInfo]);

  const handleSignin = useCallback(async () => {
    const signinResult = await authSignin(signinInfo);
    console.log(signinResult);

    if (!signinResult.success) {
      return alert(signinResult.data?.message);
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
        <legend>登録するユーザ情報を入力</legend>
        <div className={styles.form}>
          <p>
            <label>
              ユーザーID:
              <Input
                name="username"
                value={signupInfo.username}
                onChange={handleOnChangeSignup}
                type="text"
              />
            </label>
          </p>
          <p>
            <label>
              パスワード:
              <Input
                name="password"
                value={signupInfo.password}
                onChange={handleOnChangeSignup}
                type="password"
              />
            </label>
          </p>
        </div>
        <Button type="button" className={styles.button} onClick={handleSignup}>
          登録
        </Button>
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend>ログインを行うユーザ情報を入力</legend>
        <div className={styles.form}>
          <p>
            <label>
              ユーザID:
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
          ログイン
        </Button>
      </fieldset>
    </div>
  );
};

export default Sample;
