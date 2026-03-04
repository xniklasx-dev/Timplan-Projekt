"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { register } from "../../lib/auth/auth.service";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    setMessage("");

    try {
      await register({ username, email, password });

      setSuccess("Registration successful! You can now login.")
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
    <div className={styles.page}>
      <div className={styles.cards}>
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
          {success && <p className={styles.success}>{success}</p>}


          <button 
            type="submit"
            className={styles.button}
            disabled={loading}>
              
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className={styles.linkText}>
          Already have an account?{" "} 
          <Link href="/login">Login</Link>
        </p>
      

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}
