"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { register } from "@/app/lib/auth/auth.service";
import { useAuth } from "@/app/lib/auth/AuthContext";
import Spinner from "@/app/ui/spinner/Spinner";
import AccentButton from "@/app/ui/buttons/accentButton/AccentButton";

export default function RegisterPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (user) return null;
  

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const user = await register({ username, email, password });
      login(user);

      setUsername("");
      setEmail("");
      setPassword("");

      setMessage(
        "Registration successful! A confirmation email has been sent."
      );

      setTimeout(() => router.push("/login"), 2000);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        setMessage(err.message);
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={styles.title}>Register</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className={styles.input}
          type="email"
          placeholder="E-Mail"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <AccentButton 
          type="submit"
          fullWidth
          disabled={loading}>
            
          {loading ? (
          <>
            <Spinner small /> Creating account...
          </> ) : ( "Register")}
        </AccentButton>
      </form>

      <p className={styles.linkText}>
        Already have an account?{" "} 
        <Link href="/login">Sign in</Link>
      </p>
    

      {message && <p className={styles.message}>{message}</p>}
    </>
  );
}
