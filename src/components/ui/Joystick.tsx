// Joystick.tsx — Virtual analog stick for mobile movement.

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { JoystickState } from "../../types";

const MAX_TRAVEL = 48;

interface JoystickProps { stateRef: MutableRefObject<JoystickState>; }

export function Joystick({ stateRef }: JoystickProps): JSX.Element {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const base = baseRef.current;
    const knob = knobRef.current;
    if (!base || !knob) return;

    const writeState = (active: boolean, x: number, y: number): void => {
      const s = stateRef.current;
      if (!s) return;
      s.active = active;
      s.x = x;
      s.y = y;
    };

    const moveKnob = (dx: number, dy: number): void => {
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const recenter = (): void => {
      const r = base.getBoundingClientRect();
      centerRef.current.x = r.left + r.width / 2;
      centerRef.current.y = r.top + r.height / 2;
    };

    const applyPointer = (e: PointerEvent): void => {
      const c = centerRef.current;
      let dx = e.clientX - c.x;
      let dy = e.clientY - c.y;
      const dist = Math.hypot(dx, dy);
      if (dist > MAX_TRAVEL) {
        dx = (dx / dist) * MAX_TRAVEL;
        dy = (dy / dist) * MAX_TRAVEL;
      }
      moveKnob(dx, dy);
      writeState(true, dx / MAX_TRAVEL, dy / MAX_TRAVEL);
    };

    const onPointerDown = (e: PointerEvent): void => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      draggingRef.current = true;
      pointerIdRef.current = e.pointerId;
      base.setPointerCapture?.(e.pointerId);
      recenter();
      applyPointer(e);
    };

    const onPointerMove = (e: PointerEvent): void => {
      if (!draggingRef.current) return;
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      applyPointer(e);
    };

    const onPointerUp = (e: PointerEvent): void => {
      if (!draggingRef.current) return;
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      draggingRef.current = false;
      pointerIdRef.current = null;
      try { base.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
      moveKnob(0, 0);
      writeState(false, 0, 0);
    };

    base.addEventListener("pointerdown", onPointerDown);
    base.addEventListener("pointermove", onPointerMove);
    base.addEventListener("pointerup", onPointerUp);
    base.addEventListener("pointercancel", onPointerUp);
    base.addEventListener("pointerleave", onPointerUp);

    return () => {
      base.removeEventListener("pointerdown", onPointerDown);
      base.removeEventListener("pointermove", onPointerMove);
      base.removeEventListener("pointerup", onPointerUp);
      base.removeEventListener("pointercancel", onPointerUp);
      base.removeEventListener("pointerleave", onPointerUp);
    };
  }, [stateRef]);

  return (
    <div className="mobile-joystick" ref={baseRef} aria-hidden="true">
      <div className="mobile-joystick-ring" />
      <div className="mobile-joystick-knob" ref={knobRef} />
    </div>
  );
}
