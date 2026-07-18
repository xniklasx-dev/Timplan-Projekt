////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

"use client";

import styles from "../decks.module.css";
import Link from "next/link";
import type { Deck } from "@/app/lib/definitions";
import { useParams } from "next/navigation";

type DeckNavigatorProps = {
  decks: Deck[];
};

export default function DeckNavigator(props: DeckNavigatorProps) {
  const decks = props.decks;
  const params = useParams();
  const currentDeckId = params.id as string;
  const currentDeck = decks.find((deck) => deck.id === currentDeckId);
  const breadcrumbDecks: Deck[] = [];

  if (currentDeck) {
    let workingDeck: Deck | undefined = currentDeck;
    const visitedIds: string[] = [];

    while (workingDeck) {
      if (visitedIds.includes(workingDeck.id)) {
        break;
      }

      visitedIds.push(workingDeck.id);
      breadcrumbDecks.unshift(workingDeck);

      if (!workingDeck.parentDeckId) {
        break;
      }

      workingDeck = decks.find((deck) => deck.id === workingDeck!.parentDeckId);
    }
  }

  return (
    <header>
      <div>
        <nav className={styles.breadcrumbsNavigation}>
          <Link href="/decks">Decks</Link>

          {breadcrumbDecks.map((deck, index) => {
            const isLast = index === breadcrumbDecks.length - 1;

            return (
              <span
                key={deck.id}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span>{">"}</span>

                {isLast ? (
                  <span aria-current="page">{deck.name}</span>
                ) : (
                  <Link href={`/decks/${deck.id}`}>{deck.name}</Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
