"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
// import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
//      await register(email, password);

      setMessage(
        "Registrierung erfolgreich. Bestätigungsmail wurde versendet."
      );

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1>Registrieren</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-Mail"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Passwort"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Wird gespeichert..." : "Registrieren"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
