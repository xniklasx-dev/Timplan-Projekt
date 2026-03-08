'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './accountMenu.module.css';
import { useAuth } from '../../../lib/auth/AuthContext';

export default function AccountMenu(/*{ user }: { user: User | null }*/) {
  const {user, logout} = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(evt: MouseEvent) {
      if (!open) return;
      const targetElement = evt.target as Node | null;
      if (!targetElement) return;
      if (btnRef.current?.contains(targetElement)) return;
      if (menuRef.current?.contains(targetElement)) return;
      setOpen(false);
    }
    
    function onKey(evt: KeyboardEvent) {
      if (evt.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function handleLogout() {
    logout();
    setOpen(false);
    router.push('/login');
  }

  return (
    <div className={styles.accountWrap}>
      <button
        ref={btnRef}
        type="button"
        className={styles.accountButton}
        onClick={() => setOpen((value) => !value)}
        title="Account"
        aria-expanded={open ? 'true' : 'false'}
        aria-haspopup="menu"
        aria-label='Open Account Menu'
      >

        {user ? (
            <span className={styles.avatarInitial}>
              {(user.displayname ?? user.username).charAt(0).toUpperCase()}
            </span>
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
                className={styles.menuItemButton} 
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
