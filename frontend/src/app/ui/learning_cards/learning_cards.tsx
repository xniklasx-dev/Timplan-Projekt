"use client";
import { useState } from "react";
import styles from "./learning_cards.module.css";
import { Card } from "../../lib/definitions";

export default function LearnCard({ card, currentIndex, isSaving, onRate, onPrev, onSkip }: { card: Card; currentIndex: number; isSaving: boolean; onRate: (rating: NonNullable<Card["rating"]>) => void | Promise<void>; onPrev: () => void; onSkip: () => void }) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isHintRevealed, setIsHintRevealed] = useState(false);

    /*useEffect(() => {
        setIsRevealed(false);
        setIsHintRevealed(false);}, [card]);

    const handleFeedback = (type: string) => {
        let rating: 0 | 1 | 2 | 3;
        switch (type) {
            case 'again': rating = 0; break;
            case 'hard': rating = 1; break;
            case 'medium': rating = 2; break;
            case 'easy': rating = 3; break;
            default: rating = 0;
        }
        rateCard(card, rating);
    };*/

    return (
        <div className={styles.outer}>
            {card.hint && !isRevealed&&(
                <div className={styles.hint}
                    onClick={() => setIsHintRevealed(prev => !prev)}>
                        <button className={styles.hintButton} disabled={isSaving}>? Hint</button>
                        {isHintRevealed && (
                            <div className={styles.hintPopup}>
                                <p>{card.hint}</p>
                            </div>
                        )}
                </div>
            )}
            {currentIndex > 0 && 
                <button className={styles.prevButton} disabled={isSaving} onClick={() => onPrev()}>Previous</button>
            }            
            {!isRevealed&& (
                <div>
                    <button className={styles.skipButton} disabled={isSaving} onClick={() => onSkip()}>Skip</button>
                    <button className={styles.revButton} disabled={isSaving} onClick={() => setIsRevealed(true)}>Reveal Answer</button>
                </div>
            )}
            <div className={styles.topSection}>
                <p>{card.front}</p>
            </div>

            {isRevealed &&(
                <>
                    <div className={styles.line}></div>
                    <div className={styles.bottomSection}>
                        <p className={styles.ansText}>{card.back}</p>
                        <div className={styles.ansButtons}>
                            <button className={`${styles.ansButton} ${styles.again}`} disabled={isSaving} onClick={() => onRate("again")}>Again</button>
                            <button className={`${styles.ansButton} ${styles.easy}`} disabled={isSaving} onClick={() => onRate("easy")}>Easy</button>
                            <button className={`${styles.ansButton} ${styles.medium}`} disabled={isSaving} onClick={() => onRate("good")}>Good</button>
                            <button className={`${styles.ansButton} ${styles.hard}`} disabled={isSaving} onClick={() => onRate("hard")}>Hard</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
