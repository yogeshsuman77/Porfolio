import react from "../assets/creatures/react.svg";
import javascript from "../assets/creatures/javascript.svg";
import nodejs from "../assets/creatures/nodejs.svg";
import express from "../assets/creatures/express.svg";
import mongodb from "../assets/creatures/mongodb.svg";
import git from "../assets/creatures/git.svg";

/**
 * The technology "creatures" — small inhabitants of the portfolio,
 * each standing in for a real skill. This is pure content: no
 * position, no behavior. Where each one is placed lives in the
 * section that hosts it (see Projects/About/Experience); how it
 * behaves lives in <Creature> (components/Creature/Creature.jsx).
 *
 * `asset` is a static image today. To upgrade a creature to an
 * animated version later, give it an `AssetComponent` (any React
 * component) instead — <Creature> renders that in place of the
 * <img> and every interaction (idle drift, cursor response, hover
 * reveal, scroll parallax) keeps working unmodified.
 */
const creatures = {
  react: {
    id: "react",
    name: "React",
    tag: "Frontend System",
    asset: react,
    cursorReactive: true,
  },
  javascript: {
    id: "javascript",
    name: "JavaScript",
    tag: "Language",
    asset: javascript,
    cursorReactive: true,
  },
  nodejs: {
    id: "nodejs",
    name: "Node.js",
    tag: "Runtime",
    asset: nodejs,
    cursorReactive: false,
  },
  express: {
    id: "express",
    name: "Express.js",
    tag: "Server Framework",
    asset: express,
    cursorReactive: false,
  },
  mongodb: {
    id: "mongodb",
    name: "MongoDB",
    tag: "Database",
    asset: mongodb,
    cursorReactive: false,
  },
  git: {
    id: "git",
    name: "Git",
    tag: "Version Control",
    asset: git,
    cursorReactive: true,
  },
};

export default creatures;
