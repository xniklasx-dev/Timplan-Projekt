'use client';

import Navbar from '../ui/navbar/Navbar';
import styles from './layout.module.css';
import { Suspense } from 'react';
import { useAuth } from '@/app/lib/auth/AuthContext';
import Spinner from '../ui/spinner/Spinner';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.shell}>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
