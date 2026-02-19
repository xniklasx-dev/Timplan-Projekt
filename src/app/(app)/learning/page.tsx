import styles from "./page.module.css";
import InfoCard from "@/app/ui/learning_cards/learning_cards";

export default function Learning() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Deck Name ?/?</h1>
        <InfoCard title="Welcome to Learning Mode" text="Here you can review your cards and track your progress!" />
      </main>
    </div>
  );
}
