"use client";

import React, { MouseEvent } from "react";
import Image from "next/image";
import styles from "../buttons.module.css";

type EditButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  fullWidth?: boolean;
  cardId: string;
  onEditAction: (cardId: string) => void;
};

export default function EditButton(props: EditButtonProps) {
  const {
    children,
    fullWidth,
    className,
    cardId,
    onEditAction,
    onClick,
    ...buttonProps
  } = props;

  let buttonClassName = styles.base + " " + styles.iconButton;

  if (fullWidth) {
    buttonClassName += " " + styles.fullWidth;
  }

  if (className) {
    buttonClassName += " " + className;
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (onClick) {
      onClick(event);
    }

    onEditAction(cardId);
  };

  return (
    <button
      type="button"
      {...buttonProps}
      className={buttonClassName}
      onClick={handleClick}
    >
      <Image src="/edit_icon.svg" alt="Edit" width={20} height={20} />

      {children ? (
        <span className={styles.buttonText}>{children}</span>
      ) : null}
    </button>
  );
}
