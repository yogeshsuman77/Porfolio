/**
 * Project data.
 *
 * Only one real project was provided (from the resume) — NOIR. Rather
 * than pad the gallery with more placeholders, the Projects section is
 * built as a single featured spotlight. Add more entries here later
 * (each will need its own `image`/`inkVideo` pair — see
 * /public/videos/ink for two unused processed clips) and
 * `sections/projects/Projects.jsx` can go back to a multi-item gallery.
 *
 * The cover image below is still procedurally generated placeholder
 * artwork (see /scripts/gen_art.py) — no real screenshot of NOIR was
 * provided. Swap `image` for an actual screenshot/capture whenever
 * you have one; nothing else needs to change.
 *
 * `inkVideo` points to a real ink-in-water luma-matte clip (black =
 * not yet diffused, white = diffused) used to drive the reveal — see
 * `utils/inkVideoSimulation.js`.
 */

const projects = [
  {
    id: 1,
    index: "01",
    title: "NOIR",
    tagline: "Interactive Investigation Board",
    description:
      "A full-stack board for building cases: create clues, connect them, and pan/zoom through the evidence graph in real time.",
    tech: ["React", "JavaScript", "Node.js", "Express.js", "MongoDB"],
    year: "2025",
    link: "https://github.com/yogeshsuman77/NOIR", // TODO: replace with the real NOIR repo URL
    image: "/images/projects/noir.webp",
    inkVideo: "/videos/ink/ink-01.mp4",
    color: "#e2622f",
    align: "center",
    size: "lg",
    highlights: [
      "SVG-based board interactions (drag, pan, zoom) chosen over canvas for finer control.",
      "Complex board state — clues, cases, connections — managed predictably with useReducer.",
      "RESTful APIs and MongoDB schemas designed to store cases and their relationships efficiently.",
    ],
  },
];

export default projects;
