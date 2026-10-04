import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import useReducedMotion from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Drifts `ref`'s element vertically as its trigger transits the
 * viewport, at `speed` px (roughly — it's scaled by the trigger's own
 * height) — different speeds on different elements is what actually
 * produces the "layered depth" feeling; the same speed everywhere is
 * just a scroll listener.
 *
 * `speed` can be negative (drifts up while scrolling down) or
 * positive (drifts down/lags behind). These are desktop-calibrated
 * values; on narrower viewports the same pixel travel is proportionally
 * much larger relative to the (shorter, tighter) layout, which is what
 * was causing text/images to drift into each other on mobile — so the
 * effective speed is scaled down automatically based on viewport width
 * (see `parallaxFactor`), re-evaluated live on every scroll tick so a
 * resize or orientation change is picked up immediately.
 */
export function parallaxFactor() {
  const w = window.innerWidth;
  if (w <= 480) return 0.14;
  if (w <= 768) return 0.3;
  if (w <= 1024) return 0.6;
  return 1;
}

export default function useParallax(ref, { speed = 24, trigger, min, max } = {}) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const st = ScrollTrigger.create({
      trigger: trigger?.current || el,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.7,
      onUpdate: (self) => {
        let y = (self.progress - 0.5) * speed * parallaxFactor();
        if (min !== undefined) y = Math.max(min, y);
        if (max !== undefined) y = Math.min(max, y);
        gsap.set(el, { y });
      },
    });

    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, speed, min, max]);
}