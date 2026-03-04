"use client";
import { useRouter } from "next/navigation";
import styles from "./learning_end_page.module.css";

export default function LearningEndPage({ deckCards }: { deckCards: any[] }) {
    const router = useRouter();
  const size = 240;
  const strokeWidth = 30;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const total = deckCards.length;

  if (!total) return null;

  const easyCards = deckCards.filter(card => card.rating === 3).length;
  const mediumCards = deckCards.filter(card => card.rating === 2).length;
  const hardCards = deckCards.filter(card => card.rating === 1).length;

  const segments = [
    { value: hardCards, color: "var(--color-hard)" },
    { value: mediumCards, color: "var(--color-medium)" },
    { value: easyCards, color: "var(--color-easy)" },
  ];

  let cumulativePercent = 0;

  return (
    <div className="learning-end-page">
        <div className={styles.statsContainer}>
        <svg width={size} height={size}>
        {/* Background */}
            <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#222"
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
              transform={`rotate(-90 ${center} ${center})`}
            />
          );
        })}
      </svg>
      <div className={styles.stats}>
        <p>Easy: {easyCards}</p>
        <p>Medium: {mediumCards}</p>
        <p>Hard: {hardCards}</p>
      </div>
      </div>
      <button className={styles.learn_button_active} onClick={() => router.push("/learning/")}>
        Back to Dashboard
      </button>
    </div>
  );
}