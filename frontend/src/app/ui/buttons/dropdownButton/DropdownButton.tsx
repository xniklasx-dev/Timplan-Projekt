"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
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
  label?: string;
  triggerIconSrc?: string;
  triggerAriaLabel?: string;
  items: DropdownItem[];
  align?: "left" | "right";
};

function isLinkItem(item: DropdownItem): item is DropdownLinkItem {
  return "href" in item;
}

export default function DropdownButton({
  label,
  triggerIconSrc,
  triggerAriaLabel,
  items,
  align = "right",
}: DropdownButtonProps) {
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current) {
        return;
      }

      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const triggerClassName = [
    styles.base,
    styles.dropdownTrigger,
    triggerIconSrc ? styles.dropdownTriggerIconOnly : "",
    open ? styles.dropdownTriggerOpen : "",
  ]
    .filter(Boolean)
    .join(" ");

  const accessibleLabel = triggerAriaLabel ?? label ?? "Open menu";

  return (
    <div className={styles.dropdown} ref={wrapperRef}>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => setOpen((previous) => !previous)}
        aria-label={accessibleLabel}
        title={accessibleLabel}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {triggerIconSrc ? (
          <Image
            src={triggerIconSrc}
            alt=""
            width={20}
            height={20}
            className={styles.dropdownTriggerIcon}
            aria-hidden="true"
          />
        ) : (
          <span className={styles.dropdownLabel}>{label}</span>
        )}

        <span
          className={[
            styles.dropdownChevron,
            open ? styles.dropdownChevronOpen : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className={[
            styles.dropdownMenu,
            align === "left"
              ? styles.dropdownMenuLeft
              : styles.dropdownMenuRight,
          ].join(" ")}
          role="menu"
        >
          {items.map((item, index) => {
            const key = `${item.label}-${index}`;

            if (isLinkItem(item)) {
              if (item.disabled) {
                return (
                  <span
                    key={key}
                    className={[
                      styles.dropdownItem,
                      styles.dropdownItemDisabled,
                    ].join(" ")}
                    role="menuitem"
                    aria-disabled="true"
                  >
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={key}
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
                key={key}
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
