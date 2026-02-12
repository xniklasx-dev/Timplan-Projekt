'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './navbar.module.css';
import AccountMenu from '../accountMenu/AccountMenu';
import type { User } from '../../lib/definitions';

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href !== '/' && pathname.startsWith(href + '/')) return true;
  return false;
}

export default function Navbar({ user }: { user?: User | null}) {
  const pathname = usePathname() || '/';

  const links = [
    { href: '/decks', label: 'Decks' },
    { href: '/learning', label: 'Learning' },
    { href: '/statistic', label: 'Stats' },
    { href: '/sharing', label: 'Sharing' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Timplan Name */}
        <Link href="/" className={styles.brand}>
          Timplan
        </Link>

        {/* Tabs */}
        <nav className={styles.nav}>
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Account Dropdown */}
        <div className={styles.right}>
          <AccountMenu user={user ?? null} />
        </div>
      </div>
    </header>
  );
}
