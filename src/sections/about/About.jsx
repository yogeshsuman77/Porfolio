import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import useReducedMotion from "../../hooks/useReducedMotion";
import useParallax, { parallaxFactor } from "../../hooks/useParallax";
import portraitCinematic from "../../assets/images/portrait/portrait-cinematic.webp";
import "./about.css";

gsap.registerPlugin(ScrollTrigger);

const lines = ["I build", "digital systems", "that feel alive."];

const marks = [
  "React JS",
  "Tailwind CSS",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Redux Toolkit",
  "REST APIs",
  "Git",
];

function About() {
  const sectionRef = useRef(null);
  const lineRefs = useRef([]);
  const markRefs = useRef([]);
  const marksListRef = useRef(null);
  const headingRef = useRef(null);
  const portraitRef = useRef(null);
  const reducedMotion = useReducedMotion();

  // The heading and the skill marks drift at different, gentle speeds
  // relative to each other and the portrait — a layered read rather
  // than the section moving as one flat card.
  useParallax(headingRef, { speed: 45, trigger: sectionRef });
  useParallax(marksListRef, { speed: -55, trigger: sectionRef });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (reducedMotion) {
      gsap.set([...lineRefs.current, ...markRefs.current, portraitRef.current], {
        opacity: 1,
        y: 0,
        x: 0,
        filter: "none",
      });
      return;
    }

    gsap.set(lineRefs.current, { opacity: 0.08, y: 18 });
    gsap.set(markRefs.current, { opacity: 0, y: 12 });
    gsap.set(portraitRef.current, { opacity: 0, x: 24, filter: "blur(6px)" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        end: "bottom 60%",
        scrub: 0.6,
      },
    });

    lineRefs.current.forEach((el, i) => {
      tl.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, i * 0.35);
    });
    tl.to(portraitRef.current, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.8, ease: "power2.out" }, 0.3);

    const marksTl = gsap.timeline({
      scrollTrigger: {
        trigger: markRefs.current[0]?.parentElement || section,
        start: "top 80%",
      },
    });
    marksTl.to(markRefs.current, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: "power3.out",
    });

    // The portrait is the shorter element in this pairing, so it's the
    // one that drifts fast — the text column (heading + marks) is
    // taller and moves slower, per the same "smaller moves faster"
    // rule used in the Projects section.
    const portraitParallax = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.9,
      onUpdate: (self) => gsap.set(portraitRef.current, { y: (self.progress - 0.5) * -220 * parallaxFactor() }),
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      marksTl.scrollTrigger?.kill();
      marksTl.kill();
      portraitParallax.kill();
    };
  }, [reducedMotion]);

  return (
    <section id="about" className="about" ref={sectionRef} aria-label="About">
      <div className="about__stage">
        <div className="about__content">
          <span className="section-label">About</span>

          <h2 className="about__lines" ref={headingRef}>
            {lines.map((line, i) => (
              <span
                key={line}
                ref={(el) => (lineRefs.current[i] = el)}
                className="about__line"
              >
                {line}
              </span>
            ))}
          </h2>

          <p className="about__body">
            I&apos;m Yogesh Suman — a Computer Science &amp;
            Engineering graduate and MERN stack developer. Most of my work
            lives at the intersection of engineering and craft: systems that
            hold up under real use — investigation boards, automation
            pipelines, interfaces — dressed in interaction that never calls
            attention to itself for its own sake.
          </p>

          <ul className="about__marks" ref={marksListRef}>
            {marks.map((m, i) => (
              <li key={m} ref={(el) => (markRefs.current[i] = el)}>
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div ref={portraitRef} className="about__portrait" aria-hidden="true">
          <img src={portraitCinematic} alt="" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  );
}

export default About;
