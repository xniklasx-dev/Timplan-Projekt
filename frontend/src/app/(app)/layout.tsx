import Navbar from '../ui/navbar/Navbar';
import styles from './layout.module.css';
import placeholderUsers from "@/app/lib/placeholder-users.json";
import { User } from '../lib/definitions';
import { Suspense } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const rawUser = placeholderUsers[0];

  const user: User = {
    ...rawUser,
    createdAt: new Date(rawUser.createdAt),
    updatedAt: new Date(rawUser.updatedAt),
  };

  return (
    <div className={styles.shell}>
      <Suspense fallback={null}>
        <div className={styles.navbar}><Navbar user={user}/></div>
      </Suspense>
      <main className={styles.main}>{children}</main>
    </div>
  );
}