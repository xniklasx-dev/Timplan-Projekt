import Navbar from '@/app/ui/navbar/Navbar';
import styles from './layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  let user = { id: 1, name: 'Test User', email: 'test@example.com', password: 'password', createdAt: new Date(), updatedAt: new Date() };

  return (
    <div className={styles.shell}>
        <Navbar user={user}/>
      <main className={styles.main}>{children}</main>
    </div>
  );
}