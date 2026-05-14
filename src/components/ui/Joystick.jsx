// Joystick.jsx — Virtual analog stick for mobile movement.
//
// Renders a fixed-position circle at the bottom-left. Touch/drag the inner
// knob to produce a normalized 2-axis vector (-1..1) which is written into
// the shared `stateRef` so Player.jsx can read it inside its useFrame loop
// (no React re-renders per frame).
//
// Visible on small screens only (CSS-gated). On desktop the component still
// mounts but `display: none` hides it, so the listeners do nothing useful
// — that's fine, it costs essentially nothing.

import { useEffect, useRef } from "react";

const MAX_TRAVEL = 48; // px the knob can move from the base center

export function Joystick({ stateRef }) {
  const baseRef = useRef(null);
  const knobRef = useRef(null);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef(null);
  const centerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const base = baseRef.current;
    const knob = knobRef.current;
    if (!base || !knob) return;

    const writeState = (active, x, y) => {
      const s = stateRef.current;
      if (!s) return;
      s.active = active;
      s.x = x;
      s.y = y;
    };

    const moveKnob = (dx, dy) => {
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const recenter = () => {
      const r = base.getBoundingClientRect();
      centerRef.current.x = r.left + r.width / 2;
      centerRef.current.y = r.top + r.height / 2;
    };

    const onPointerDown = (e) => {
      // Only react to primary touch / left mouse.
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      draggingRef.current = true;
      pointerIdRef.current = e.pointerId;
      base.setPointerCapture?.(e.pointerId);
      recenter();
      applyPointer(e);
    };

    const applyPointer = (e) => {
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

    const onPointerMove = (e) => {
      if (!draggingRef.current) return;
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      applyPointer(e);
    };

    const onPointerUp = (e) => {
      if (!draggingRef.current) return;
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      draggingRef.current = false;
      pointerIdRef.current = null;
      try { base.releasePointerCapture?.(e.pointerId); } catch {}
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
