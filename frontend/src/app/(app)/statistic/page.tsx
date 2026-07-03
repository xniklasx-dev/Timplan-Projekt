import styles from "./page.module.css";
import ChartComponent from "@/app/ui/chart/Chart";

export default function Statistic() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Statistics</h1>
        <ChartComponent />
      </main>
    </div>
  );
}
