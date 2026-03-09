"use client";
import { useRef, useState } from "react";
import AccentButton from "@/app/ui/buttons/accentButton/AccentButton";
import { useClickOutside } from "@/app/hooks/useClickOutside";
import styles from "./page.module.css";

interface Props {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useClickOutside([modalRef], onClose, true);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Later: Call API to send reset email
    setSent(true);
  }

  return (
    <div className={styles.modalOverlay}>
      <div ref={modalRef} className={styles.modal}>
        <h2 className={styles.modalTitle}>Reset Password</h2>
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
            />
            <AccentButton type="submit" fullWidth>
              Send reset link
            </AccentButton>
            <button type="button" className={styles.linkButton} onClick={onClose}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}