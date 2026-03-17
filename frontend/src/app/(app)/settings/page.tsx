"use client";

import Link from "next/link";
import { useAuth  } from "@/app/lib/auth/AuthContext";
import styles from "./page.module.css";
import Spinner from "@/app/ui/spinner/Spinner";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

    if (isLoading) return <Spinner />;
    if (!user) return null; 

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile</h2>
          <div className={styles.card}>
            <div className={styles.avatar}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Username</span>
                <span className={styles.infoValue}>{user.username}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{user.email}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Member since</span>
                <span className={styles.infoValue}>{user.createdAt}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Cards */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <div className={styles.navCard}>
            <Link href="/settings/account" className={styles.navItem}>
              <div className={styles.navItemLeft}>
                <span className={styles.navItemTitle}>Account Settings</span>
                <span className={styles.navItemSub}>Edit username, email and password</span>
              </div>
              <span className={styles.navArrow}>›</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}