import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import projects from "../../data/projects";
import ProjectItem from "./ProjectItem";
import useReducedMotion from "../../hooks/useReducedMotion";
import "./projects.css";

gsap.registerPlugin(ScrollTrigger);

function Projects() {
  const sectionRef = useRef(null);
  const itemRefs = useRef([]);
  const reducedMotion = useReducedMotion();

  // As the project passes through the viewport, the shared vein
  // background's flowing vessel picks up its accent color — a subtle
  // thread of continuity between the gallery and the living background.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const root = document.documentElement;
    const triggers = projects.map((project, i) => {
      const el = itemRefs.current[i];
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top 65%",
        end: "bottom 35%",
        onEnter: () => gsap.to(root, { "--vein-color": project.color, duration: 1, overwrite: "auto" }),
        onEnterBack: () => gsap.to(root, { "--vein-color": project.color, duration: 1, overwrite: "auto" }),
        onLeave: () => gsap.to(root, { "--vein-color": "#f1720c", duration: 1, overwrite: "auto" }),
        onLeaveBack: () => gsap.to(root, { "--vein-color": "#f1720c", duration: 1, overwrite: "auto" }),
      });
    });
    return () => triggers.forEach((t) => t?.kill());
  }, [reducedMotion]);

  const isSingleFeature = projects.length === 1;

  return (
    <section id="work" className="projects" ref={sectionRef} aria-label="Selected work">
      <header className="projects__intro">
        <span className="eyebrow">{isSingleFeature ? "Featured Work" : "Selected Work"}</span>
        <h2>
          {isSingleFeature ? (
            <>
              One project, built
              <br />
              start to finish.
              <br />
              More is on the way.
            </>
          ) : (
            <>
              The colour was always
              <br />
              there. It just needed
              <br />a reason to surface.
            </>
          )}
        </h2>
      </header>

      <div className={`projects__list${isSingleFeature ? " projects__list--single" : ""}`}>
        {projects.map((project, i) => (
          <ProjectItem
            key={project.id}
            project={project}
            innerRef={(el) => (itemRefs.current[i] = el)}
          />
        ))}
      </div>
    </section>
  );
}

export default Projects;
