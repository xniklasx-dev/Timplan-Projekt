"use client";

import React from "react";
import Image from "next/image";
import styles from "../buttons.module.css";

type StartLessonButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  fullWidth?: boolean;
};

export default function StartLessonButton(props: StartLessonButtonProps) {
  const children = props.children;
  const fullWidth = props.fullWidth;
  const className = props.className;

  let buttonClassName = styles.base + " " + styles.iconButton;

  if (fullWidth) {
    buttonClassName += " " + styles.fullWidth;
  }

  if (className) {
    buttonClassName += " " + className;
  }

  return (
    <button {...props} className={buttonClassName}>
      <Image
        src="/play_lesson_icon.svg"
        alt="Start Lesson"
        width={20}
        height={20}
      />

      {children ? (
        <span className={styles.buttonText}>{children}</span>
      ) : null}
    </button>
  );
}