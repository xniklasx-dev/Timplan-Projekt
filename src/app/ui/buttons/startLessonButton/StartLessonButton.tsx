"use client";

import React, { JSX } from "react";
import Image from "next/image"; // ✅ import Next.js Image
import styles from "./startLessonButton.module.css";

type StartLessonButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode; // optional, you might only show the icon
  fullWidth?: boolean;
};

export default function StartLessonButton({
  fullWidth,
  children,
  className,
  ...props
}: StartLessonButtonProps): JSX.Element {
  return (
    <button
      className={`${styles.button} ${fullWidth ? styles.fullWidth : ""} ${className || ""}`}
      {...props}
    >
      {/* Icon */}
      <Image
        src="/play_lesson_icon.svg"
        alt="Start Lesson"
        width={20}
        height={20}
      />

      {/* Optional text / children */}
      {children && <span className={styles.buttonText}>{children}</span>}
    </button>
  );
}
