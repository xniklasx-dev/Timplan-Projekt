import styles from "./page.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Cards({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Deck ID: {id} ...</h1>
      </main>
    </div>
  );
}