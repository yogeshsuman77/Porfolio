export const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const lerp = (a, b, t) => a + (b - a) * t;

/** Remaps `value` from [inMin, inMax] to [outMin, outMax], clamped. */
export const mapRange = (value, inMin, inMax, outMin = 0, outMax = 1) => {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return lerp(outMin, outMax, t);
};

/** Eases a 0-1 value with a gentle ease-out, used to make scrubbed
 * progress feel like it has weight/momentum rather than linear travel. */
export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);

export const easeInCubic = (t) => clamp(t) ** 3;

export const easeInOutQuad = (t) => {
  t = clamp(t);
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};
