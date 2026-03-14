"use client";

import { useRef, useLayoutEffect, useCallback } from "react";
import type { Deck, Card } from "@/app/lib/definitions";
import DeckCard from "../deckCard/DeckCard";
import SingleCard from "../singleCard/SingleCard";
import styles from "@/app/(app)/decks/page.module.css";

type DeckGridProps = {
  decks?: Deck[];
  cards?: Card[];
  isGridView: boolean;
  onEditCardAction: (cardId: string) => void;
};

export default function DeckGrid({
  decks = [],
  cards = [],
  isGridView,
  onEditCardAction,
}: DeckGridProps) {
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    hasMounted.current = true;
  }, []);

  const animateFlip = useCallback(() => {
    const measure = () => {
      const rects = new Map<string, DOMRect>();
      cardRefs.current.forEach((el, id) => {
        rects.set(id, el.getBoundingClientRect());
      });
      return rects;
    };

    const first = measure();
    requestAnimationFrame(() => {
      const last = measure();
      cardRefs.current.forEach((el, id) => {
        const a = first.get(id);
        const b = last.get(id);
        if (!a || !b) return;

        const dx = a.left - b.left;
        const dy = a.top - b.top;
        const sx = a.width / b.width;
        const sy = a.height / b.height;

        if (dx === 0 && dy === 0 && sx === 1 && sy === 1) return;

        el.animate(
          [
            { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
            { transform: "translate(0px, 0px) scale(1, 1)" },
          ],
          {
            duration: 380,
            easing: "cubic-bezier(.2, .8, .2, 1)",
          },
        );
      });
    });
  }, []);

  useLayoutEffect(() => {
    if (hasMounted.current) animateFlip();
  }, [decks, cards, isGridView, animateFlip]);

  if (decks.length === 0 && cards.length === 0) {
    return <p className={styles.subtitle}>No items found</p>;
  }

  return (
    <section className={isGridView ? styles.deckGrid : styles.deckLine}>
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          isGridView={isGridView}
          registerRefAction={(el) => {
            if (!el) return;
            cardRefs.current.set(deck.id, el);
          }}
        />
      ))}

      {cards.map((card) => (
        <SingleCard
          key={card.id}
          card={card}
          isGridView={isGridView}
          onEditAction={onEditCardAction}
          registerRefAction={(el) => {
            if (!el) return;
            cardRefs.current.set(card.id, el);
          }}
        />
      ))}
    </section>
  );
}
