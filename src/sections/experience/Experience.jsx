import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import experience from "../../data/experience";
import useReducedMotion from "../../hooks/useReducedMotion";
import useParallax from "../../hooks/useParallax";
import "./experience.css";

gsap.registerPlugin(ScrollTrigger);

function Experience() {
  const sectionRef = useRef(null);
  const rowRefs = useRef([]);
  const row0Ref = useRef(null);
  const row1Ref = useRef(null);
  const reducedMotion = useReducedMotion();

  // Each row drifts at a slightly different speed as it passes
  // through — alternating direction keeps it from reading as the
  // whole timeline just sliding as one block.
  useParallax(row0Ref, { speed: 65, trigger: sectionRef });
  useParallax(row1Ref, { speed: -65, trigger: sectionRef });

  useEffect(() => {
    if (reducedMotion) {
      gsap.set(rowRefs.current, { opacity: 1, x: 0 });
      return undefined;
    }
    const triggers = rowRefs.current.map((row) =>
      row
        ? ScrollTrigger.create({
            trigger: row,
            start: "top 85%",
            onEnter: () => gsap.to(row, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }),
            onLeaveBack: () => gsap.to(row, { opacity: 0, x: -16, duration: 0.5 }),
          })
        : null
    );
    gsap.set(rowRefs.current, { opacity: 0, x: -16 });
    return () => triggers.forEach((t) => t?.kill());
  }, [reducedMotion]);

  return (
    <section id="experience" className="experience" ref={sectionRef} aria-label="Experience">
      <span className="section-label">Experience</span>
      <h2 className="experience__title">Where the work has happened</h2>

      <div className="experience__timeline">
        {experience.map((role, i) => (
          <article
            key={role.id}
            className="experience__row"
            ref={(el) => {
              rowRefs.current[i] = el;
              if (i === 0) row0Ref.current = el;
              if (i === 1) row1Ref.current = el;
            }}
          >
            <div className="experience__row-head">
              <h3 className="experience__role">{role.role}</h3>
              <span className="experience__company">{role.company}</span>
              <span className="experience__period">{role.period}</span>
            </div>

            <ul className="experience__bullets">
              {role.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <ul className="experience__tech" aria-label={`Technologies used at ${role.company}`}>
              {role.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="experience__footer">
        <p className="experience__also">
          Also: B.Tech in Computer Science &amp; Engineering, Modi Institute of
          Technology (2022–2026) · Job-Ready Cohort, Sheriyans
          Coding School (2024–2025) · Frontend Development Internship, GRRAS
          Solutions (Jul–Aug 2024).
        </p>
      </div>
    </section>
  );
}

export default Experience;
