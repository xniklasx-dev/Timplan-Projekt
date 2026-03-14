"use client";

import React, { JSX } from "react";
import Image from "next/image";
import styles from "../buttons.module.css";

type EditButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  fullWidth?: boolean;
  cardId: string;
  onEditAction: (cardId: string) => void;
};

export default function EditButton({
  fullWidth,
  children,
  className,
  cardId,
  onEditAction,
  onClick,
  ...props
}: EditButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={`${styles.base} ${styles.iconButton} ${
        fullWidth ? styles.fullWidth : ""
      } ${className || ""}`}
      {...props}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        onClick?.(e);
        onEditAction(cardId);
      }}
    >
      <Image src="/edit_icon.svg" alt="Edit" width={20} height={20} />
      {children && <span className={styles.buttonText}>{children}</span>}
    </button>
  );
}
