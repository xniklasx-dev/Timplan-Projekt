'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Navbar.module.css';
import NavSearch from './search/NavSearch';
import AccountMenu from './accountMenu/AccountMenu';
import type { User } from '../../lib/definitions';

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href !== '/' && pathname.startsWith(href + '/')) return true;
  return false;
}

export default function Navbar({ user }: { user?: User | null }) {
  const pathname = usePathname() || '/';
  const [searchOpen, setSearchOpen] = useState(false);

  const links = [
    { href: '/decks', label: 'Decks' },
    { href: '/learning', label: 'Learning' },
    { href: '/statistic', label: 'Stats' },
    { href: '/sharing', label: 'Sharing' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Timplan
        </Link>

        <nav
          className={`${styles.nav} ${
            searchOpen ? styles.navSearchOpen : ''
          }`}
        >
          <div className={styles.navLinks}>
            {links.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${
                    active ? styles.navLinkActive : ''
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <NavSearch
            open={searchOpen}
            onOpen={() => setSearchOpen(true)}
            onClose={() => setSearchOpen(false)}
          />
        </nav>

        <div className={styles.right}>
          <AccountMenu user={user ?? null} />
        </div>
      </div>
    </header>
  );
}