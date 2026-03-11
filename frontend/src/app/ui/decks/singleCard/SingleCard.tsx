"use client";

import type { Card } from "@/app/lib/definitions";
import styles from "@/app/(app)/decks/page.module.css";

type SingleCardProps = {
    card: Card;
    isGridView: boolean;
    registerRefAction?: (el: HTMLDivElement | null) => void;
};

export default function SingleCard({
    card,
    isGridView,
    registerRefAction: registerRef,
}: SingleCardProps) {
    return (
        <div
            ref={registerRef}
            className={`${styles.deckCard} ${isGridView ? styles.deckCardGrid : styles.deckCardLine
                }`}
        >
            <div className={styles.deckTop}>
                <h2 className={styles.deckName}>{card.front}</h2>

                <p className={styles.deckDescription}>{card.back}</p>
            </div>
        </div>
    );
}