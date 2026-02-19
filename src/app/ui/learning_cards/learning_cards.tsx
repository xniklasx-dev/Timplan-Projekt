import styles from "./learning_cards.module.css";

export default function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className={styles.outer}>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}