"use client";

import { useState } from "react";
import styles from "@/app/(app)/decks/page.module.css";

type DropdownButtonProps = {
    label: string;
    items: { label: string; onClick: () => void }[];
};

export default function DropdownButton({ label, items }: DropdownButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className={styles.dropdown}>
            <button
                className={styles.dropdownButton}
                onClick={() => setOpen((prev) => !prev)}
            >
                {label}
            </button>

            {open && (
                <ul className={styles.dropdownMenu}>
                    {items.map((item, idx) => (
                        <li key={idx}>
                            <button
                                className={styles.dropdownItem}
                                onClick={() => {
                                    item.onClick();
                                    setOpen(false);
                                }}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}