import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ProjectImage from "../../components/ProjectReveal/ProjectImage";
import useReducedMotion from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

function ProjectItem({ project, innerRef }) {
  const rootRef = useRef(null);
  const visualRef = useRef(null);
  const metaRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = metaRef.current;
    if (!el) return undefined;

    if (reducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return undefined;
    }

    gsap.set(el, { opacity: 0, y: 24 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 82%",
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }),
      onLeaveBack: () => gsap.to(el, { opacity: 0, y: 24, duration: 0.5, ease: "power2.in" }),
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  // The image is the larger element here, so it drifts slower and
  // steadier; the text column is smaller, so it moves faster past it —
  // both travel the same direction ("parallelly"), just at different
  // rates, so the pair reads as two depths rather than one flat block.
  // The range is generous enough that each starts a little below its
  // resting spot and finishes a little past it, not just a wobble.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const root = rootRef.current;
    const visual = visualRef.current;
    const meta = metaRef.current;
    if (!root || !visual || !meta) return undefined;

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.7,
      onUpdate: (self) => {
        const p = self.progress - 0.5;
        gsap.set(visual, { y: p * -90 });
        gsap.set(meta, { y: p * -240 });
      },
    });
    return () => trigger.kill();
  }, [reducedMotion]);

  return (
    <article
      ref={(el) => {
        rootRef.current = el;
        innerRef(el);
      }}
      className={`project-item project-item--${project.align} project-item--${project.size}`}
      style={{ "--project-color": project.color }}
    >
      <div className="project-item__grid">
        <div ref={visualRef} className="project-item__visual">
          <ProjectImage project={project} />
        </div>

        <div ref={metaRef} className="project-item__meta">
          <span className="project-item__index">{project.index}</span>
          <h3 className="project-item__title">{project.title}</h3>
          <p className="project-item__tagline">{project.tagline}</p>
          <p className="project-item__description">{project.description}</p>
          {project.highlights?.length > 0 && (
            <ul className="project-item__highlights">
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          <ul className="project-item__tech" aria-label={`Technologies used in ${project.title}`}>
            {project.tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {project.link && project.link !== "#" && (
            <a className="project-item__link" href={project.link} target="_blank" rel="noreferrer">
              View on GitHub ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProjectItem;
