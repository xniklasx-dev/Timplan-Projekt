"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { login } from "../../lib/auth/auth.service";
import { useAuth } from "../../lib/auth/AuthContext";


export default function LoginPage() {
  console.log("USE_MOCK:", process.env.NEXT_PUBLIC_USE_MOCK);
  const router = useRouter();
  const { user, login: loginContext } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login({ emailOrUsername, password });
      loginContext(user);

      router.push("/");

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.cards}>
        <h1 className={styles.title}>Login</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="E-Mail or Username"
            required
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
          />

          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p className={styles.forgotPassword}>
            <Link href="/forgot-password">Forgot password?</Link>
          </p>

          <button 
            type="submit"
            className={styles.button}
            disabled={loading}>
              
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      
        {error && <p className={styles.error}>{error}</p>}
        
        <p className={styles.linkText}>
          Don&apos;t have an account?{" "} 
          <Link href="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
