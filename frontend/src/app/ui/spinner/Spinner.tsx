"use client";

import styles from "./spinner.module.css";

export default function Spinner({ small = false }: { small?: boolean }) {
    return <div className={small ? styles.spinnerSmall : styles.spinner}></div>;
}