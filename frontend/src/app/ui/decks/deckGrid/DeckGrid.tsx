"use client";

import { useRef, useLayoutEffect } from "react";
import type { Deck } from "@/app/lib/definitions";
import DeckCard from "../deckCard/DeckCard";
import styles from "@/app/(app)/decks/page.module.css";

type DeckGridProps = {
    decks: Deck[];
    isGridView: boolean;
};

export default function DeckGrid({ decks, isGridView }: DeckGridProps) {
    const cardRefs = useRef(new Map<string, HTMLElement>());
    const hasMounted = useRef(false);

    useLayoutEffect(() => {
        hasMounted.current = true;
    }, []);

    const measure = () => {
        const rects = new Map<string, DOMRect>();
        cardRefs.current.forEach((el, id) => {
            rects.set(id, el.getBoundingClientRect());
        });
        return rects;
    };

    const animateFlip = (next: boolean) => {
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
    };

    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!hasMounted.current) {
            return;
        }
        const next = event.target.checked;
        animateFlip(next);
    };

    if (!decks || decks.length === 0) {
        return <p className={styles.subtitle}>No decks found</p>;
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
        </section>
    );
}