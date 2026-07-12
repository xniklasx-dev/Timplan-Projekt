"use client";

import { useLayoutEffect, useRef } from "react";
import type { Deck, Card } from "@/app/lib/definitions";
import DeckCard from "../deckCard/DeckCard";
import SingleCard from "../singleCard/SingleCard";
import styles from "@/app/(app)/decks/page.module.css";
import AddItemCard from "../addItemCard/AddItemCard";

type AddItemConfig = {
  label: string;
  onClickAction: () => void;
};

type DeckGridProps = {
  decks?: Deck[];
  cards?: Card[];
  isGridView: boolean;
  onEditCardAction: (cardId: string) => void;
  addItem?: AddItemConfig;
};

const EMPTY_DECKS: Deck[] = [];
const EMPTY_CARDS: Card[] = [];

export default function DeckGrid(props: DeckGridProps) {
  const decks = props.decks ?? EMPTY_DECKS;

  const cards = props.cards ?? EMPTY_CARDS;
  const isGridView = props.isGridView;
  const onEditCardAction = props.onEditCardAction;
  const addItem = props.addItem;

  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const firstRender = useRef(true);

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const firstPositions = new Map<string, DOMRect>();

    itemRefs.current.forEach((element, id) => {
      firstPositions.set(id, element.getBoundingClientRect());
    });

    requestAnimationFrame(() => {
      itemRefs.current.forEach((element, id) => {
        const firstRect = firstPositions.get(id);
        const lastRect = element.getBoundingClientRect();

        if (!firstRect) {
          return;
        }

        const moveX = firstRect.left - lastRect.left;
        const moveY = firstRect.top - lastRect.top;
        const scaleX = firstRect.width / lastRect.width;
        const scaleY = firstRect.height / lastRect.height;

        if (moveX === 0 && moveY === 0 && scaleX === 1 && scaleY === 1) {
          return;
        }

        element.animate(
          [
            {
              transform: `translate(${moveX}px, ${moveY}px) scale(${scaleX}, ${scaleY})`,
            },
            {
              transform: "translate(0px, 0px) scale(1, 1)",
            },
          ],
          {
            duration: 380,
            easing: "cubic-bezier(.2, .8, .2, 1)",
          },
        );
      });
    });
  }, [decks, cards, isGridView]);

  if (decks.length === 0 && cards.length === 0 && !addItem) {
    return <p className={styles.subtitle}>No items found</p>;
  }

  let layoutClass = styles.deckLine;

  if (isGridView) {
    layoutClass = styles.deckGrid;
  }

  return (
    <section className={layoutClass}>
      {addItem && (
        <AddItemCard
          isGridView={isGridView}
          label={addItem.label}
          onClickAction={addItem.onClickAction}
        />
      )}

      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          isGridView={isGridView}
          registerRefAction={(element) => {
            if (!element) {
              return;
            }

            itemRefs.current.set(deck.id, element);
          }}
        />
      ))}

      {cards.map((card) => (
        <SingleCard
          key={card.id}
          card={card}
          isGridView={isGridView}
          onEditAction={onEditCardAction}
          registerRefAction={(element) => {
            if (!element) {
              return;
            }

            itemRefs.current.set(card.id, element);
          }}
        />
      ))}
    </section>
  );
}
