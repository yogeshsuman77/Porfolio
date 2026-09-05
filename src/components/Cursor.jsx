import { useEffect, useRef } from "react";
import gsap from "gsap";
import useReducedMotion from "../hooks/useReducedMotion";
import useMediaQuery from "../hooks/useMediaQuery";

/**
 * A quiet cursor accent: a small ring that trails the pointer with a
 * touch of lag, and tightens slightly over interactive elements. Absent
 * on touch devices and when reduced motion is requested.
 */
function Cursor() {
  const dotRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const isFine = useMediaQuery("(pointer: fine)");
  const enabled = isFine && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    if (!dot) return;

    const quickX = gsap.quickTo(dot, "x", { duration: 0.5, ease: "power3.out" });
    const quickY = gsap.quickTo(dot, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e) => {
      quickX(e.clientX);
      quickY(e.clientY);
    };

    const onOver = (e) => {
      const interactive = e.target.closest("a, button, [role='button']");
      gsap.to(dot, { scale: interactive ? 1.8 : 1, duration: 0.35, ease: "power2.out" });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={dotRef} className="cinematic-cursor" aria-hidden="true" />;
}

export default Cursor;
