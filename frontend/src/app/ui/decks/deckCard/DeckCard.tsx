"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Deck } from "@/app/lib/definitions";
import StartLessonButton from "@/app/ui/buttons/startLessonButton/StartLessonButton";
import styles from "@/app/(app)/decks/page.module.css";

type DeckCardProps = {
    deck: Deck;
    isGridView: boolean;
    registerRefAction?: (el: HTMLAnchorElement | null) => void;
};

export default function DeckCard({
    deck,
    isGridView,
    registerRefAction,
}: DeckCardProps) {
    const router = useRouter();

    const hasCards = deck.cardIds?.length > 0;

    return (
        <Link
            href={`/decks/${deck.id}`}
            ref={registerRefAction}
            className={`${styles.deckCard} ${isGridView ? styles.deckCardGrid : styles.deckCardLine
                }`}
        >
            <div className={styles.startButtonWrapper}>
                <StartLessonButton
                    title={hasCards ? "Start studying" : "No cards in this deck yet"}
                    disabled={!hasCards}
                    onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (!hasCards) return;

                        router.push("/learning/" + deck.id);
                    }}
                />
            </div>

            <div className={styles.deckTop}>
                <h2 className={styles.deckName}>{deck.name}</h2>

                {deck.description && (
                    <p className={styles.deckDescription}>{deck.description}</p>
                )}
            </div>

            <div className={styles.deckStats}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{deck.cardIds.length}</span>
                    <span className={styles.statLabel}>Cards</span>
                </div>

                <div className={styles.stat}>
                    <span className={styles.statValue}>{deck.dueToday}</span>
                    <span className={styles.statLabel}>Due</span>
                </div>

                <div className={styles.stat}>
                    <span className={styles.statValue}>{deck.newCards}</span>
                    <span className={styles.statLabel}>New</span>
                </div>

                {deck.childDeckIds && deck.childDeckIds.length > 0 && (
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{deck.childDeckIds.length}</span>
                        <span className={styles.statLabel}>Subdecks</span>
                    </div>
                )}
            </div>
        </Link>
    );
}