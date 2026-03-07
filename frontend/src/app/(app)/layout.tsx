import Navbar from '../ui/navbar/Navbar';
import styles from './layout.module.css';
import { Suspense } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Suspense fallback={null}>
        <div className={styles.navbar}>
          <Navbar /></div>
      </Suspense>
      <main className={styles.main}>{children}</main>
    </div>
  );
}