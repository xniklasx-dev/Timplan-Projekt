"use client";

import { useState, useRef } from "react";
import { useAuth } from "../../../lib/auth/AuthContext";
import styles from "./page.module.css";

export default function AccountSettingsPage() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [displayname, setDisplayname] = useState(user?.displayname ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Later: API-Call to upload avatar and get URL, for now just convert to base64
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Image size must be less than 2MB.");
      return;
    }
    //const objectURL = URL.createObjectURL(file);
    //setAvatarUrl(objectURL);
    //updateUser({ avatarUrl: objectURL });

    const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;
    console.log("base64 length:", base64.length);
    setAvatarUrl(base64);
    updateUser({ avatarUrl: base64 });
    console.log("user after update:", localStorage.getItem("timplan_user"));
  };
  reader.readAsDataURL(file);
  }

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    if (!username.trim() || !email.trim()) {
      setProfileError("Username and email cannot be empty.");
      return;
    }
    // Later: API-Call to update profile
    updateUser({ username, email, displayname });
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
    // Later: API-Call to change password
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

              {/* Avatar Upload */}
              <div className={styles.avatarSection}>
                <div className={styles.avatarPreview}
                    onClick={() => fileInputRef.current?.click()}>
                    {avatarUrl ? (
                      <div className={styles.avatarImageWrapper}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={avatarUrl} 
                          alt="Avatar" 
                          className={styles.avatarImage} />
                      </div>
                  ) : (
                    <span className={styles.avatarInitial}>
                      {(user?.displayname ?? user?.username ?? "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className={styles.avatarOverlay}>Change</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Upload avatar image"
                  className={styles.avatarInput}
                  onChange={handleAvatarChange}
                />
                {avatarUrl && (
                  <button
                    type="button"
                    className={styles.removeAvatarButton}
                    onClick={() => {
                      setAvatarUrl("");
                      updateUser({ avatarUrl: "" });
                    }}
                  >
                    Remove photo
                  </button>
                )}
              </div>
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
                <label className={styles.label}>Display Name</label>
                <input
                  className={styles.input}
                  type="text"
                  value={displayname}
                  onChange={(e) => setDisplayname(e.target.value)}
                  placeholder="Your display name"
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