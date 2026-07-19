////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

"use client";

import { useEffect, type CSSProperties } from "react";
import Image from "next/image";

import styles from "./Toast.module.css";

type ToastProps = {
  message: string | null;
  title?: string;
  durationMs?: number;
  onClose?: () => void;
};

export default function Toast({ message, title = "Saved", durationMs = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (!message || !onClose) return;

    const timeoutId = window.setTimeout(onClose, durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [durationMs, message, onClose]);

  if (!message) return null;

  return (
    <div
      className={styles.toast}
      role="status"
      style={{ "--toast-duration": `${durationMs}ms` } as CSSProperties}
    >
      <span className={styles.icon} aria-hidden="true">✓</span>

      <span className={styles.text}>
        <strong>{title}</strong>
        <span>{message}</span>
      </span>

      {onClose && (
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close notification">
          <Image src="/close_icon.svg" alt="" width={18} height={18} />
        </button>
      )}

      {onClose && <span className={styles.timerBar} aria-hidden="true" />}
    </div>
  );
}
