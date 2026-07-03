"use client";
import { useState, useEffect } from "react";
import styles from "./learning_cards.module.css";
import { Card } from "../../lib/definitions";

export default function LearnCard({ card, currentIndex, onRate, onPrev, onSkip, changeIndex, deckLength }: { card: Card; currentIndex: number; onRate: (rating: 0 | 1 | 2 | 3) => void; onPrev: () => void; onSkip: () => void; changeIndex: (index: number) => void; deckLength: number }) {
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
                        <button className={styles.hintButton}>? Hint</button>
                        {isHintRevealed && (
                            <div className={styles.hintPopup}>
                                <p>{card.hint}</p>
                            </div>
                        )}
                </div>
            )}
            {currentIndex > 0 && 
                <button className={styles.prevButton} onClick={() => onPrev()}>Previous</button>
            }            
            {!isRevealed&& (
                <div>
                    <button className={styles.skipButton} onClick={() => onSkip()}>Skip</button>
                    <button className={styles.revButton} onClick={() => setIsRevealed(true)}>Reveal Answer</button>
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
                            <button className={`${styles.ansButton} ${styles.again}`} onClick={() => onRate(0)}>Again</button>
                            <button className={`${styles.ansButton} ${styles.easy}`} onClick={() => onRate(3)}>Easy</button>
                            <button className={`${styles.ansButton} ${styles.medium}`} onClick={() => onRate(2)}>Medium</button>
                            <button className={`${styles.ansButton} ${styles.hard}`}  onClick={() => onRate(1)}>Hard</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}