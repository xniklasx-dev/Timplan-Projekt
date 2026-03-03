import DashboardLearning from "@/app/ui/learning_cards/dashboard_learning";
import styles from "./page.module.css";

export default function LearningDashboard() {
  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <h1>Dashboard Learning</h1>
        <DashboardLearning />
      </div>
    </div>
  );
}