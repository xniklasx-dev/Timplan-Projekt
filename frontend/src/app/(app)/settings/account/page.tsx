"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/app/lib/auth/AuthContext";
import Spinner from "@/app/ui/spinner/Spinner";
import AccentButton from "@/app/ui/buttons/accentButton/AccentButton";
import {
  updateAvatar,
  updateProfile,
  updatePassword,
  deleteAvatar,
  deleteAccount
} from "@/app/lib/auth/auth.service";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, updateUser, logout: logoutContext, isLoading } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [displayname, setDisplayName] = useState(user?.displayname ?? "");
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

  if (isLoading) return <Spinner />;
      if (!user) return null;


  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Image size must be less than 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);
      const updated = await updateAvatar(base64, user!.token);
      updateUser({ ...updated, token: user!.token });
    };
    reader.readAsDataURL(file);
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    if (!username.trim() || !email.trim()) {
      setProfileError("Username and email cannot be empty.");
      return;
    }
    if (!user) return null;

    try {
      const updated = await updateProfile({username, email, displayname}, user.token);
      updateUser({ ...updated, token:user.token })
      setProfileSuccess("Profile updated successfully.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setProfileError(err.message);
      } else {
        setProfileError("Update Profile failed");
      }
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
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

    if (!user) return;
    try {
      await updatePassword({currentPassword, newPassword}, user.token);
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError("Update password failed")
      }
    }
  }

  async function handleDeleteAvatar() {
    if (!user) return null;
    try {
      await deleteAvatar(user.token);
      setAvatarUrl("");
      updateUser({ avatarUrl: undefined });
    } catch (err) {
      if (err instanceof Error) {
        setProfileError(err.message);
      } else {
        setProfileError("Avatar deletion failed")
      }
    }
  }

  async function handleDeleteAccount() {
    if (!user) return null;

    try {
      await deleteAccount(user.token);
      logoutContext();
      router.push('/login')
      setProfileSuccess("Profile deleted successfully.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setProfileError(err.message);
      } else {
        setProfileError("Delete Profile failed");
      }
    }
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
                    onClick={handleDeleteAvatar}
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
                  onChange={(e) => setDisplayName(e.target.value)}
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
              <AccentButton type="submit" fullWidth>
                Save Changes
              </AccentButton>
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
              <AccentButton type="submit" fullWidth>
                Change Password
              </AccentButton>
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
                  onClick={handleDeleteAccount}
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