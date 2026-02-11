import Link from 'next/link';
import styles from './layout.module.css';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className={styles.header}>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <Link href="/settings/account">Account Settings</Link>
        <Link href="/decks">Library</Link>
        <Link href="/learning">Learning Mode</Link>
        <Link href="/statistic">Statistic</Link>
      </header>

      <main>{children}</main>
    </div>
  );
}
