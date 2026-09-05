import { useEffect, useRef } from "react";
import "./hero.css";
import heroAvatar from "../../assets/images/hero-avatar.webp";
import heroTextBg from "../../assets/images/hero-text-bg.png";

import { animateHeroIntro } from "../../animations/hero";
import gsap from "gsap";
import useReducedMotion from "../../hooks/useReducedMotion";
import useMediaQuery from "../../hooks/useMediaQuery";
import useParallax from "../../hooks/useParallax";

function Hero() {
  const bgTextRef = useRef(null);
  const avatarRef = useRef(null);
  const avatarTiltRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionContainerRef = useRef(null);
  const descriptionRef = useRef(null);
  const bottomFadeRef = useRef(null);
  const contentsRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const isFinePointer = useMediaQuery("(pointer: fine)");

  // Different layers drift at different speeds as the hero scrolls
  // past — the background text furthest, the avatar a little, the
  // copy least of all — so leaving the hero itself feels layered
  // rather than the whole scene sliding off as one flat plane.
  useParallax(bgTextRef, { speed: 700 });
  useParallax(avatarRef, { speed: 450 });
  useParallax(contentsRef, { speed: 250 });

  useEffect(() => {
    animateHeroIntro({
      bgText: bgTextRef.current,
      avatar: avatarRef.current,
      heading: headingRef.current,
      description: descriptionRef.current,
      descriptionContainer: descriptionContainerRef.current,
      bottomFade: bottomFadeRef.current,
    });
  }, []);

  // A quiet "living" touch: the avatar tilts gently toward the cursor,
  // like it's paying attention rather than sitting on a fixed plane.
  useEffect(() => {
    if (reducedMotion || !isFinePointer) return undefined;
    const el = avatarTiltRef.current;
    const container = avatarRef.current;
    if (!el || !container) return undefined;

    const rotateX = gsap.quickTo(el, "rotateX", { duration: 0.6, ease: "power3.out" });
    const rotateY = gsap.quickTo(el, "rotateY", { duration: 0.6, ease: "power3.out" });
    const translateY = gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" });

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotateY(px * 14);
      rotateX(-py * 10);
      translateY(py * -8);
    };
    const onLeave = () => {
      rotateX(0);
      rotateY(0);
      translateY(0);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [reducedMotion, isFinePointer]);

  return (
    <section className="hero">
      <span ref={bottomFadeRef} className="hero-bottom-fade"></span>

      <div ref={bgTextRef} className="hero-text-bg-container">
        <img src={heroTextBg} alt="" />
      </div>

      <div ref={avatarRef} className="hero-avatar-container">
        <div ref={avatarTiltRef} className="hero-avatar-tilt">
          <img src={heroAvatar} alt="heroAvatar" />
        </div>
      </div>

      <div ref={contentsRef} className="hero-text-contents">
        <h1 ref={headingRef}>
          hi, i&apos;m <br />
          <span>Yogesh</span>
        </h1>

        <div className="hero-text-details-main-container">
          <div ref={descriptionContainerRef}>
            <p ref={descriptionRef}>
              MERN stack developer building systems that hold up under real
              use — from an interactive investigation board to automation
              pipelines that quietly do the repetitive work.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;