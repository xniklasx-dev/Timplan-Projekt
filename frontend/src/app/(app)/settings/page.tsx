"use client";

import Link from "next/link";
import styles from "./page.module.css";

// Später durch echten Auth-Context ersetzen
const mockUser = {
  username: "testuser",
  email: "testuser@example.com",
  createdAt: "2026-02-20",
};

export default function SettingsPage() {
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
              {mockUser.username.charAt(0).toUpperCase()}
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Username</span>
                <span className={styles.infoValue}>{mockUser.username}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{mockUser.email}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Member since</span>
                <span className={styles.infoValue}>{mockUser.createdAt}</span>
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