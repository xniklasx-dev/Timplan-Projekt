"use client";

import React from "react";
import styles from "../buttons.module.css";

type AccentButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  fullWidth?: boolean;
};

export default function AccentButton(props: AccentButtonProps) {
  const children = props.children;
  const fullWidth = props.fullWidth;
  const className = props.className;

  let buttonClassName = styles.base + " " + styles.accent;

  if (fullWidth) {
    buttonClassName += " " + styles.fullWidth;
  }

  if (className) {
    buttonClassName += " " + className;
  }

  return (
    <button {...props} className={buttonClassName}>
      {children}
    </button>
  );
}