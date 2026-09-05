/** Mulberry32 seeded PRNG — deterministic, tiny, good enough for organic
 * geometry generation (branch angles, ink wobble) without a dependency. */
export function makeRng(seed = 1) {
  let a = seed >>> 0 || 1;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rngRange = (rng, min, max) => min + rng() * (max - min);
