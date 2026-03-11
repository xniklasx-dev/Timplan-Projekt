"use client";

import styles from "@/app/(app)/decks/page.module.css";

type DeckHeaderProps = {
    title?: string;
    subtitle?: string;
    isGridView: boolean;
    onToggleViewAction: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function DeckHeader({
    title = "Deck Library",
    subtitle = "Select a deck to start studying",
    isGridView,
    onToggleViewAction,
}: DeckHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.titleRow}>
                <h1 className={styles.title}>{title}</h1>

                <label className={styles.viewToggle}>
                    <input
                        type="checkbox"
                        className={styles.toggleInput}
                        checked={isGridView}
                        onChange={onToggleViewAction}
                    />

                    <div className={styles.toggleTrack}>
                        <div className={styles.toggleIndicator}></div>

                        <span className={styles.toggleOption}>
                            <svg viewBox="0 0 24 24" className={styles.icon}>
                                <rect x="4" y="5" width="16" height="3" rx="1" />
                                <rect x="4" y="10.5" width="16" height="3" rx="1" />
                                <rect x="4" y="16" width="16" height="3" rx="1" />
                            </svg>
                        </span>

                        <span className={styles.toggleOption}>
                            <svg viewBox="0 0 24 24" className={styles.icon}>
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </span>
                    </div>
                </label>
            </div>

            <p className={styles.subtitle}>{subtitle}</p>
        </header>
    );
}