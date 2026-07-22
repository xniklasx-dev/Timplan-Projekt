"use client";

import React from "react";
import styles from "../buttons.module.css";

type AccentButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  fullWidth?: boolean;
};

export default function AccentButton(props: AccentButtonProps) {
  const { children, fullWidth, className, ...rest } = props;

  let buttonClassName = styles.base + " " + styles.accent;

  if (fullWidth) {
    buttonClassName += " " + styles.fullWidth;
  }

  if (className) {
    buttonClassName += " " + className;
  }

  return (
    <button {...rest} className={buttonClassName}>
      {children}
    </button>
  );
}
