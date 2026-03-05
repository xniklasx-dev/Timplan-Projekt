import styles from "./page.module.css";
import ChartComponent from "../../ui/chart/Chart";

export default function Statistic() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1> Statistic Page</h1>
        <ChartComponent />
      </main>
    </div>
  );
}
