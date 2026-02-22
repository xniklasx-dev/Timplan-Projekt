"use client";

import React, { JSX } from "react";
import styles from "./accentButton.module.css";

type AccentButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  fullWidth?: boolean;
};

export default function AccentButton({
  children,
  fullWidth,
  className,
  ...props
}: AccentButtonProps): JSX.Element {
  return (
    <button
      className={`${styles.button} ${fullWidth ? styles.fullWidth : ""} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
