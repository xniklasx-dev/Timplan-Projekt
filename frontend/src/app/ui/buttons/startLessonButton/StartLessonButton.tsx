"use client";

import type { ButtonHTMLAttributes } from "react";
import Image from "next/image";

import styles from "../buttons.module.css";

type StartLessonButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
>;

export default function StartLessonButton({
  className,
  ...buttonProps
}: StartLessonButtonProps) {
  const buttonClassName = [styles.base, styles.iconButton, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...buttonProps} className={buttonClassName}>
      <Image
        src="/play_lesson_icon.svg"
        alt="Start Lesson"
        width={20}
        height={20}
      />
    </button>
  );
}
