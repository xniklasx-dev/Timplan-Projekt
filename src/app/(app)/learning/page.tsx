import styles from "./page.module.css";
import InfoCard from "@/app/ui/learning_cards/learning_cards";

export default function Learning() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Deck Name ?/?</h1>
        <InfoCard question="What color does the sky have?" answer="Green" />
      </main>
    </div>
  );
}
