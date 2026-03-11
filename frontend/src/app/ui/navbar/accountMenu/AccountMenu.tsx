'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './accountMenu.module.css';
import { useAuth } from '@/app/lib/auth/AuthContext';
import { useClickOutside } from '@/app/hooks/useClickOutside';

export default function AccountMenu(/*{ user }: { user: User | null }*/) {
  const {user, logout} = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useClickOutside([btnRef, menuRef], () => setOpen(false), open);

  function handleLogout() {
    logout();
    setOpen(false);
    router.push('/login');
  }

  return (
    <div className={styles.accountWrap}>
      {/* axe-disable aria-valid-attr-value */}
      <button
        ref={btnRef}
        type="button"
        className={styles.accountButton}
        onClick={() => setOpen((value) => !value)}
        title="Account"
        aria-expanded={(open)}
        aria-haspopup="menu"
        aria-label='Open Account Menu'
      >

        {user ? (
          user.avatarUrl ? (
           // eslint-disable-next-line @next/next/no-img-element 
            <img 
              src={user.avatarUrl} 
              alt="Avatar" 
              className={styles.avatarImage} />
          ) : (
            <span className={styles.avatarInitial}>
              {(user.displayname ?? user.username).charAt(0).toUpperCase()}
            </span>
          )
        ) : (
          <span className={styles.avatarIcon}/>
          )}
      </button>

      {open && (
        <div ref={menuRef} className={styles.accountMenu}>
          {user ? (
            <>
              <div className={styles.menuHeader}>
                <div className={styles.menuTitle}>{user.displayname ?? user.username}</div>
                <div className={styles.menuSub}>{user.email ?? ''}</div>
              </div>

              <div className={styles.menuDivider} />

              {/* Coming soon */}
              <button
                className={styles.menuItemButton}
                type="button"
                disabled
              >
                <span className={styles.menuItemInner}>
                  {/*<UserPlus size={16} />*/}
                  Switch Account
                </span>
              </button>

              <div className={styles.menuDivider} />

              <Link 
                className={styles.menuItem} 
                href="/settings"
                onClick={() => setOpen(false)}>
                Settings
              </Link>

              <div className={styles.menuDivider} />

              <button 
                className={`${styles.menuItemButton} ${styles.menuItemLogout}`} 
                type="button" 
                onClick={handleLogout}
                aria-label='Logout'>
                Logout
              </button>
            </>
          ) : (
            <>
              <div className={styles.menuHeader}>
                <div className={styles.menuTitle}>Not signed in</div>
                <div className={styles.menuSub}>Login or create an account</div>
              </div>

              <div className={styles.menuDivider} />

              <Link 
                className={styles.menuItem} 
                href="/login" 
                role="menuitem"
                onClick={() => setOpen(false)}>
                Login
              </Link>

              <Link 
                className={styles.menuItem} 
                href="/register" 
                role="menuitem"
                onClick={() => setOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
