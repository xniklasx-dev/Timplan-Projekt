"use client";

import React, { JSX } from "react";
import Image from "next/image";
import styles from "../buttons.module.css";

type StartLessonButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
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
      className={`${styles.base} ${styles.iconButton} ${fullWidth ? styles.fullWidth : ""} ${className || ""}`}
      {...props}
    >
      <Image
        src="/play_lesson_icon.svg"
        alt="Start Lesson"
        width={20}
        height={20}
      />

      {children && <span className={styles.buttonText}>{children}</span>}
    </button>
  );
}
