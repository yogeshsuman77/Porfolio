import { makeRng, rngRange } from "./rng";

/**
 * Generates an organic branching vein network as an array of
 * { d, width, depth, opacity } path descriptors, spanning a viewBox of
 * `width` x `height`. Loosely modeled on how vasculature branches:
 * a handful of thick root vessels that fork repeatedly into thinner,
 * more numerous, more erratic capillaries.
 */
export function generateVeins({
  width,
  height,
  seed = 7,
  rootCount = 5,
  maxDepth = 4,
}) {
  const rng = makeRng(seed);
  const branches = [];

  function grow(x, y, angle, depth, trunkWidth) {
    const segments = 4 + Math.floor(rngRange(rng, 0, 3));
    const segLength = height / (segments * 1.6);
    let cx = x;
    let cy = y;
    let cAngle = angle;
    const points = [[cx, cy]];

    for (let s = 0; s < segments; s++) {
      cAngle += rngRange(rng, -0.5, 0.5);
      cx += Math.cos(cAngle) * segLength;
      cy += Math.sin(cAngle) * segLength * 1.4; // biased downward travel
      points.push([cx, cy]);

      // Occasionally fork into a thinner sibling branch.
      if (depth < maxDepth && s > 0 && rng() < 0.32) {
        grow(cx, cy, cAngle + rngRange(rng, 0.6, 1.4) * (rng() < 0.5 ? 1 : -1), depth + 1, trunkWidth * 0.58);
      }
    }

    let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
    for (let i = 1; i < points.length - 1; i++) {
      const [px, py] = points[i];
      const [nx, ny] = points[i + 1];
      const mx = (px + nx) / 2;
      const my = (py + ny) / 2;
      d += ` Q ${px.toFixed(1)} ${py.toFixed(1)}, ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    const last = points[points.length - 1];
    d += ` T ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;

    branches.push({
      d,
      width: Math.max(0.6, trunkWidth),
      depth,
      opacity: depth === 0 ? 0.5 : Math.max(0.14, 0.5 - depth * 0.11),
    });
  }

  for (let i = 0; i < rootCount; i++) {
    const startX = width * ((i + 0.5) / rootCount) + rngRange(rng, -width * 0.06, width * 0.06);
    const startAngle = Math.PI / 2 + rngRange(rng, -0.35, 0.35);
    grow(startX, -height * 0.02, startAngle, 0, rngRange(rng, 2.4, 3.4));
  }

  return branches;
}
