"use client";

import { useState } from "react";
import styles from "./page.module.css";

// Später durch echten Auth-Context ersetzen
const mockUser = {
  username: "testuser",
  email: "testuser@example.com",
};

export default function AccountSettingsPage() {
  const [username, setUsername] = useState(mockUser.username);
  const [email, setEmail] = useState(mockUser.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    if (!username.trim() || !email.trim()) {
      setProfileError("Username and email cannot be empty.");
      return;
    }
    // Später: API-Call
    setProfileSuccess("Profile updated successfully.");
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    // Später: API-Call
    setPasswordSuccess("Password changed successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <h1 className={styles.title}>Account Settings</h1>
          <p className={styles.subtitle}>Edit your profile information and password</p>
        </div>

        {/* Profile Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile Information</h2>
          <div className={styles.card}>
            <form onSubmit={handleProfileSave} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Username</label>
                <input
                  className={styles.input}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>
              {profileError && <p className={styles.error}>{profileError}</p>}
              {profileSuccess && <p className={styles.success}>{profileSuccess}</p>}
              <button type="submit" className={styles.button}>
                Save Changes
              </button>
            </form>
          </div>
        </section>

        {/* Password Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Change Password</h2>
          <div className={styles.card}>
            <form onSubmit={handlePasswordChange} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Current Password</label>
                <input
                  className={styles.input}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>New Password</label>
                <input
                  className={styles.input}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Confirm New Password</label>
                <input
                  className={styles.input}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              {passwordError && <p className={styles.error}>{passwordError}</p>}
              {passwordSuccess && <p className={styles.success}>{passwordSuccess}</p>}
              <button type="submit" className={styles.button}>
                Change Password
              </button>
            </form>
          </div>
        </section>

        {/* Danger Zone */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitleDanger}>Danger Zone</h2>
          <div className={styles.dangerCard}>
            <div className={styles.dangerInfo}>
              <span className={styles.dangerTitle}>Delete Account</span>
              <span className={styles.dangerSub}>
                This action cannot be undone. All your data will be permanently deleted.
              </span>
            </div>
            {!showDeleteConfirm ? (
              <button
                className={styles.dangerButton}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </button>
            ) : (
              <div className={styles.confirmRow}>
                <span className={styles.confirmText}>Are you sure?</span>
                <button
                  className={styles.dangerButton}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.dangerButtonConfirm}
                  onClick={() => alert("Account deletion not yet implemented.")}
                >
                  Yes, delete
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}