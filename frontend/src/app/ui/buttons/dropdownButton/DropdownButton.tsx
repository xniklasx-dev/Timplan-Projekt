"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "../buttons.module.css";

type DropdownActionItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type DropdownLinkItem = {
  label: string;
  href: string;
  disabled?: boolean;
};

type DropdownItem = DropdownActionItem | DropdownLinkItem;

type DropdownButtonProps = {
  label: string;
  items: DropdownItem[];
  align?: "left" | "right";
};

function isLinkItem(item: DropdownItem): item is DropdownLinkItem {
  return "href" in item;
}

export default function DropdownButton({
  label,
  items,
  align = "right",
}: DropdownButtonProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className={styles.dropdown} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.base} ${styles.dropdownTrigger} ${
          open ? styles.dropdownTriggerOpen : ""
        }`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className={styles.dropdownLabel}>{label}</span>
        <span
          className={`${styles.dropdownChevron} ${
            open ? styles.dropdownChevronOpen : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className={`${styles.dropdownMenu} ${
            align === "left"
              ? styles.dropdownMenuLeft
              : styles.dropdownMenuRight
          }`}
          role="menu"
        >
          {items.map((item, index) => {
            if (isLinkItem(item)) {
              if (item.disabled) {
                return (
                  <span
                    key={`${item.label}-${index}`}
                    className={`${styles.dropdownItem} ${styles.dropdownItemDisabled}`}
                    role="menuitem"
                    aria-disabled="true"
                  >
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={`${item.label}-${index}`}
                  href={item.href}
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={`${item.label}-${index}`}
                type="button"
                className={styles.dropdownItem}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
