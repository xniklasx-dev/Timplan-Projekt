import { useEffect, RefObject } from "react";

export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  onClose: () => void,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;
    
    function onPointerDown(evt: PointerEvent) {
      const target = evt.target as Node | null;
      if (!target) return;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onClose();
    }

    function onKey(evt: KeyboardEvent) {
      if (evt.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, refs, onClose]);
}