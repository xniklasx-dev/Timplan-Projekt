"use client";

import React, { JSX, useState } from "react";
import Image from "next/image";
import styles from "../buttons.module.css";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";

type EditButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode;
    fullWidth?: boolean;
    cardId: string;               // the card to edit
};

export default function EditButton({
    fullWidth,
    children,
    className,
    cardId,
    ...props
}: EditButtonProps): JSX.Element {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                className={`${styles.base} ${styles.iconButton} ${fullWidth ? styles.fullWidth : ""} ${className || ""}`}
                {...props}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsModalOpen(true);
                }}
            >
                <Image
                    src="/edit_icon.svg"
                    alt="Edit"
                    width={20}
                    height={20}
                />
                {children && <span className={styles.buttonText}>{children}</span>}
            </button>

            <SingleCardEditor
                open={isModalOpen}
                cardId={cardId}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}