"use client";
import { useState } from "react";
import styles from "./learning_cards.module.css";

export default function InfoCard({ question, answer }: { question: string; answer: string }) {
    const [isClicked, setIsClicked] = useState(false);
    return (
        <div className={styles.outer}>
            <p>{question}</p> <br />
            <hr className={styles.line} />
            {isClicked && <p>{answer}</p> }
            {!isClicked && (
                <button className={styles.button} onClick={() => setIsClicked(true)}>
                    Reveal Answer
                </button>
            )}
        </div>
        
    );
}