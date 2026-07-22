"use client";
import { useRouter } from "next/navigation";
import type { Card, Deck } from "@/app/lib/definitions";
import styles from "./learning_end_page.module.css";

type LearningEndPageProps = {
  deckCards: Card[];
  selectedDeck: Deck;
};

export default function LearningEndPage({ deckCards, selectedDeck }: LearningEndPageProps) {
    const router = useRouter();
  const size = 240;
  const strokeWidth = 30;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const total = deckCards.length;
  const hasResults = total > 0;

  const easyCards = deckCards.filter(card => card.rating === "easy").length;
  const mediumCards = deckCards.filter(card => card.rating === "good").length;
  const hardCards = deckCards.filter(card => card.rating === "hard").length;

  const segments = hasResults ? [
    { value: hardCards, color: "var(--color-hard)" },
    { value: mediumCards, color: "var(--color-medium)" },
    { value: easyCards, color: "var(--color-easy)" },
  ] : [];


  let cumulativePercent = 0;

  return (
    <div className={styles.learningEndPage}>
        <h1 className={styles.h1}>Wonderful! You have completed the deck {selectedDeck.name}!</h1>
        <div className={styles.divider}></div>
        <div className={styles.total}>Total cards reviewed: {total}</div>
        <div className={styles.statsContainer}>
          <svg className={styles.progressRing} viewBox={`0 0 ${size} ${size}`}>
            {/* Background */}
            <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="var(--color-disabled)"
                strokeWidth={strokeWidth}
                fill="transparent"/>

            {segments.map((segment, index) => {
              const percent = segment.value / total;
              const dashLength = circumference * percent;
              const dashOffset = circumference * cumulativePercent;

              cumulativePercent += percent;

              return (
                <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeDashoffset={-dashOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${center} ${center})`}/>
              );
            })}
          </svg>
        <div className={styles.stats}>
          <p className={styles.statItem}>
            <span className={`${styles.colorDot} ${styles.easyDot}`}></span>
            Easy: {easyCards}
          </p>
          <p className={styles.statItem}>
            <span className={`${styles.colorDot} ${styles.mediumDot}`}></span>
            Good: {mediumCards}
          </p>
          <p className={styles.statItem}>
            <span className={`${styles.colorDot} ${styles.hardDot}`}></span>
            Hard: {hardCards}
          </p>
        </div>
      </div>
      <button className={styles.backDashboard} onClick={() => router.push("/learning/")}>
        Back to Dashboard
      </button>
    </div>
  );
}
