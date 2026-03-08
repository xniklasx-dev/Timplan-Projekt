"use client";
import { useState } from "react";
import styles from "./page.module.css";

interface Props {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Later: Call API to send reset email
    setSent(true);
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Reset Password</h2>
        {sent ? (
          <>
            <p className={styles.modalText}>
              If this email exists, a reset link has been sent.
            </p>
            <button type="button" className={styles.button} onClick={onClose}>
              Back to Login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <p className={styles.modalText}>
              Enter your email address and we will send you a reset link.
            </p>
            <input
              className={styles.input}
              type="email"
              placeholder="E-Mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className={styles.button}>
              Send reset link
            </button>
            <button type="button" className={styles.linkButton} onClick={onClose}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}