'use client';

import Navbar from '../ui/navbar/Navbar';
import styles from './layout.module.css';
import { Suspense } from 'react';
import { useAuth } from '../lib/auth/AuthContext';
import Spinner from '../ui/spinner/Spinner';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  
  return (
    <div className={styles.shell}>
      <Suspense fallback={null}>
        <div className={styles.navbar}>
          <Navbar />
        </div>
      </Suspense>
      <main className={styles.main}>{children}</main>
    </div>
  );
}