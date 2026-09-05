import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import useReducedMotion from "../../hooks/useReducedMotion";
import useParallax from "../../hooks/useParallax";
import portraitSeated from "../../assets/images/portrait/portrait-seated.webp";
import logoMark from "../../assets/images/logo-mark.webp";
import "./contact.css";

gsap.registerPlugin(ScrollTrigger);

const links = [
  {
    label: "Email",
    href: "mailto:sumanyogesh678@gmail.com",
    value: "sumanyogesh678@gmail.com",
  },
  // TODO: swap in the real GitHub/LinkedIn URLs — resume only listed link text, not hrefs.
  { label: "GitHub", href: "https://github.com/yogeshsuman77", value: "github.com/yogeshsuman" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/yogesh-suman77/", value: "linkedin.com/in/yogeshsuman" },
];

const POOL_TRIGGER = 0.55; // fire the ink once the pool has mostly formed
const POOL_RESET = 0.3;

function Contact() {
  const sectionRef = useRef(null);
  const poolRef = useRef(null);
  const videoRef = useRef(null);
  const logoRef = useRef(null);
  const portraitRef = useRef(null);
  const titleRef = useRef(null);
  const linksRef = useRef(null);
  const firedRef = useRef(false);
  const reducedMotion = useReducedMotion();

  // The title and the links drift at small, opposite speeds — the
  // pool itself gets its own separate parallax layer too — so the
  // ending reads as depth settling rather than a flat card fading.
  useParallax(titleRef, { speed: 150, trigger: sectionRef });
  useParallax(linksRef, { speed: -140, trigger: sectionRef });
  useParallax(poolRef, { speed: 260, trigger: sectionRef });

  // The pool itself forms with scroll (scale/opacity), same as before.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const pool = poolRef.current;
    if (!pool) return undefined;

    gsap.set(pool, { scale: 0.4, opacity: 0 });
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 75%",
      end: "top 20%",
      scrub: 0.8,
      onUpdate: (self) => {
        gsap.set(pool, {
          scale: 0.4 + self.progress * 0.6,
          opacity: self.progress,
        });
      },
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  // The ink inside it, unlike the project reveals, plays only once: it
  // triggers the moment the visitor actually arrives, runs through the
  // real clip exactly once, and freezes on its last frame — it never
  // loops in the background. Once it settles, the personal mark
  // resolves out of the pigment, like a signature drying.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const video = videoRef.current;
    const logo = logoRef.current;
    if (!video || !logo) return undefined;

    gsap.set(logo, { opacity: 0, scale: 0.9 });

    const onEnded = () => {
      gsap.to(logo, { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" });
    };
    video.addEventListener("ended", onEnded);

    const reset = () => {
      video.pause();
      video.currentTime = 0;
      gsap.killTweensOf(logo);
      gsap.set(logo, { opacity: 0, scale: 0.9 });
    };

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 75%",
      end: "top 20%",
      onUpdate: (self) => {
        if (!firedRef.current && self.progress >= POOL_TRIGGER) {
          firedRef.current = true;
          video.play().catch(() => onEnded());
        } else if (firedRef.current && self.progress < POOL_RESET) {
          firedRef.current = false;
          reset();
        }
      },
    });

    return () => {
      trigger.kill();
      video.removeEventListener("ended", onEnded);
    };
  }, [reducedMotion]);

  // The person appears once, faintly, as the world settles — then
  // disappears again before the section ends. A presence, not a photo.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const portrait = portraitRef.current;
    if (!portrait) return undefined;

    gsap.set(portrait, { opacity: 0 });
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom bottom",
      scrub: 0.9,
      onUpdate: (self) => {
        const p = self.progress;
        // Rise and fall across the section's transit — never a hard cut.
        const opacity = Math.max(0, Math.sin(p * Math.PI)) * 0.22;
        gsap.set(portrait, { opacity, y: (0.5 - p) * -20 });
      },
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  return (
    <section id="contact" className="contact" ref={sectionRef} aria-label="Contact">
      {!reducedMotion && (
        <div ref={portraitRef} className="contact__portrait" aria-hidden="true">
          <img src={portraitSeated} alt="" loading="lazy" decoding="async" />
        </div>
      )}

      <div ref={poolRef} className="contact__pool-wrap" aria-hidden="true">
        <div className="contact__pool-glow" />
        {!reducedMotion && (
          <video
            ref={videoRef}
            className="contact__pool-video"
            src="/videos/ink/ink-03.mp4"
            muted
            playsInline
            preload="metadata"
          />
        )}
        <img
          ref={logoRef}
          src={logoMark}
          alt=""
          className="contact__pool-logo"
        />
      </div>

      <span className="section-label">Contact</span>
      <h2 className="contact__title" ref={titleRef}>
        Let&apos;s make something
        <br />
        worth remembering.
      </h2>

      <ul className="contact__links" ref={linksRef}>
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} target="_blank" rel="noreferrer">
              <span className="contact__link-label">{link.label}</span>
              <span className="contact__link-value">{link.value}</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="contact__footnote">Designed &amp; built by Yogesh Suman — {new Date().getFullYear()}</p>
    </section>
  );
}

export default Contact;
