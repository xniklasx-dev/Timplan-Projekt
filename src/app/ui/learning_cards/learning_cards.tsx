"use client";
import { useState } from "react";
import styles from "./learning_cards.module.css";

export default function InfoCard({ question, answer }: { question: string; answer: string }) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isHintRevealed, setIsHintRevealed] = useState(false);

    const handleFeedback = (type: string) => {
        console.log(`User marked answer as: ${type}`);
        // Hier könntest du z.B. zur nächsten Karte springen
        // setIsRevealed(false);
        // nextCard();
    };

    return (
        <div className={styles.outer}>
            <div className={styles.hint}
                onMouseEnter={() => setIsHintRevealed(true)}
                onMouseLeave={() => setIsHintRevealed(false)}>
                <button className={styles.hintButton}>? Hint</button>
                {isHintRevealed && (
                    <div className={styles.hintPopup}>
                        <p>This is a hint!</p>
                    </div>
                )}
            </div>
            <button className={styles.prevButton}>Previous</button>
            {!isRevealed&& (
                <button className={styles.skipButton}>Skip</button>
            )}
            <div className={styles.topSection}>
                <p>{question}</p>
            </div>

            <div className={styles.line}></div>

            <div className={styles.bottomSection}>
                {!isRevealed ? (
                        <button className={styles.revButton} onClick={() => setIsRevealed(true)}>Reveal Answer</button>
                ) : (
                    <div>
                        <p className={styles.ansText}>{answer}</p>
                        <div className={styles.ansButtons}>
                            <button className={`${styles.ansButton} ${styles.again}`} onClick={() => handleFeedback('again')}>Again</button>
                            <button className={`${styles.ansButton} ${styles.easy}`} onClick={() => handleFeedback('easy')}>Easy</button>
                            <button className={`${styles.ansButton} ${styles.medium}`} onClick={() => handleFeedback('medium')}>Medium</button>
                            <button className={`${styles.ansButton} ${styles.hard}`}  onClick={() => handleFeedback('hard')}>Hard</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}