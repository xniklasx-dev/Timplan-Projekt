"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";
import Image from "next/image";

import styles from "../buttons.module.css";

type EditButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  cardId: string;
  onEditAction: (cardId: string) => void;
};

export default function EditButton({
  className,
  cardId,
  onEditAction,
  onClick,
  ...buttonProps
}: EditButtonProps) {
  const buttonClassName = [styles.base, styles.iconButton, className]
    .filter(Boolean)
    .join(" ");

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onClick?.(event);
    onEditAction(cardId);
  }

  return (
    <button
      type="button"
      {...buttonProps}
      className={buttonClassName}
      onClick={handleClick}
    >
      <Image src="/edit_icon.svg" alt="Edit" width={20} height={20} />
    </button>
  );
}
