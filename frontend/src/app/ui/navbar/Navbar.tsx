"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import AccountMenu from "./accountMenu/AccountMenu";
import styles from "./navbar.module.css";
import NavSearch from "./search/NavSearch";

const links = [
  { href: "/decks", label: "Decks" },
  { href: "/learning", label: "Learning" },
  { href: "/statistic", label: "Stats" },
  { href: "/testing", label: "Testing" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Timplan
        </Link>

        <nav className={`${styles.nav} ${searchOpen ? styles.navSearchOpen : ""}`} aria-label="Main navigation">
          <div className={styles.navLinks}>
            {links.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <NavSearch open={searchOpen} onOpen={() => setSearchOpen(true)} onClose={() => setSearchOpen(false)} />
        </nav>

        <div className={styles.right}>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
