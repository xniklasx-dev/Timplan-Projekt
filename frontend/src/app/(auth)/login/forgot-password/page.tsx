"use client";
import React, { useRef, useState } from "react";
import AccentButton from "@/app/ui/buttons/accentButton/AccentButton";
import { useClickOutside } from "@/app/hooks/useClickOutside";
import styles from "../page.module.css";
import Spinner from "@/app/ui/spinner/Spinner";
import {requestPasswordReset} from "@/app/lib/auth/auth.service";

interface Props {
  onClose: () => void;
}

export default function Page({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);

  useClickOutside([modalRef], onClose, true);

 async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div ref={modalRef} className={styles.modal}>
        <h2 className={styles.modalTitle}>Reset Password</h2>
        {error && <p className={styles.error}></p>}
        {sent ? (
          <>
            <p className={styles.modalText}>
              If this email exists, a reset link has been sent.
            </p>
            <AccentButton type="button" onClick={onClose} autoFocus fullWidth>
              Back to Login
            </AccentButton>
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
              disabled={loading}
            />
            <AccentButton type="submit" fullWidth disabled={loading}>
              {loading ? <Spinner /> : "Sent reset link"}
            </AccentButton>
            <button
                type="button"
                className={styles.linkButton}
                onClick={onClose}
                disabled={loading}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}