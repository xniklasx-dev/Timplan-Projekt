import LearningSession from "./LearningSession";

type LearningPageProps = { params: Promise<{ deckId: string }>; searchParams: Promise<{ mode: string }> };

export default async function LearningPage({ params, searchParams }: LearningPageProps) {
  const { deckId } = await params;
  const { mode: requestedMode } = await searchParams;

  const mode = requestedMode === "all" ? "all" : "due";

  return <LearningSession deckId={deckId} mode={mode} />;
}