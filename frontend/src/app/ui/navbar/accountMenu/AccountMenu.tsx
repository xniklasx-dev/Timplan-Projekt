'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styles from './accountMenu.module.css';
import type { User } from '../../../lib/definitions';

export default function AccountMenu({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(evt: PointerEvent) {
      if (!open) return;
      const target = evt.target as Node | null;
      if (!target) return;
      if (btnRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      setOpen(false);
    }
    
    function onKey(evt: KeyboardEvent) {
      if (evt.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.accountWrap}>
      <button
        ref={btnRef}
        type="button"
        className={styles.accountButton}
        onClick={() => setOpen((value) => !value)}
        title="Account"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label='Open Account Menu'
      >
      </button>

      {open && (
        <div ref={menuRef} className={styles.accountMenu}>
          {user ? (
            <>
              <div className={styles.menuHeader}>
                <div className={styles.menuTitle}>{user.name ?? 'Account'}</div>
                <div className={styles.menuSub}>{user.email ?? ''}</div>
              </div>

              <div className={styles.menuDivider} />

              <Link className={styles.menuItem} href="/settings" onClick={() => setOpen(false)}>
                Settings
              </Link>
              {/*<Link className={styles.menuItem} href="/test">
                Put New Links here
              </Link>*/}

              <div className={styles.menuDivider} />

              {/* TODO: Implement logout functionality */}
              <button 
              className={styles.menuItemButton} 
              type="button"
              aria-label='Logout Button'
              >
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
              aria-label='Login Button'
              >
                Login
              </Link>
              <Link 
              className={styles.menuItem} 
              href="/register" 
              role="menuitem"
              aria-label='Register Button'
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
