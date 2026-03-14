"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { login } from "@/app/lib/auth/auth.service";
import { useAuth } from "@/app/lib/auth/AuthContext";
import Spinner from "@/app/ui/spinner/Spinner";
import AccentButton from "@/app/ui/buttons/accentButton/AccentButton";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function LoginPage() {
  console.log("USE_MOCK:", process.env.NEXT_PUBLIC_USE_MOCK);
  const router = useRouter();
  const { login: loginContext } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
    <>
      <h1 className={styles.title}>Login</h1>

      <form onSubmit={showForgotPassword ? (e) => e.preventDefault() : handleSubmit} className={styles.form}>
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
          <button
            type="button"
            className={styles.forgotPasswordButton}
            onClickCapture={() => setShowForgotPassword(true)}
          >
            Forgot password?
          </button>
        </p>

        <AccentButton 
          type="submit"
          fullWidth
          disabled={loading}>
            
          {loading ? (
          <>
            <Spinner small /> Logging in...
          </> ) : ( "Login")}
        </AccentButton>
      </form>
    
      {error && <p className={styles.error}>{error}</p>}
      
      <p className={styles.linkText}>
        Don&apos;t have an account?{" "} 
        <Link href="/register">Sign up</Link>
      </p>
    
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </>
  );
}
