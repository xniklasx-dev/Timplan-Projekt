"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "../login/page.module.css";
import Spinner from "@/app/ui/spinner/Spinner";
import AccentButton from "@/app/ui/buttons/accentButton/AccentButton";
import { resetPassword } from "@/app/lib/auth/auth.service";

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setError] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!token) {
            setError("Invalid or missing reset token.");
        }

        if (password.length < 8) {
            setError("Password mus be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
        }

        setLoading(true);

        try {
            await resetPassword({ token: token as string, newPassword: password });
            setMessage("Password successfully reseted. Redirecting to login...");
            setTimeout(() => router.push("/login"), 2000);
            setPassword("");
            setConfirmPassword("");

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className={styles.container}>
                <h2 className={styles.errorTitle}>Invalid Link</h2>
                <p className={styles.errorText}>The password reset token is missing or invalid.</p>
                <Link href="/login" className={styles.link}>Back to Login</Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.modalTitle}>Set New Password</h2>

            {err && <p className={styles.error}>{err}</p>}
            {message && <p className={styles.success}>{message}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <p className={styles.modalText}>
                    Please enter your new password below.
                </p>
                <input
                    className={styles.input}
                    type="password"
                    placeholder="New Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
                <input
                    className={styles.input}
                    type="password"
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                />
                <AccentButton type="submit" fullWidth disabled={loading}>
                    {loading ? <Spinner /> : "Reset password"}
                </AccentButton>
            </form>
        </div>
    );
}