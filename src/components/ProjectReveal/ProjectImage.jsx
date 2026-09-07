import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { VideoInkDiffusion } from "../../utils/inkVideoSimulation";
import useReducedMotion from "../../hooks/useReducedMotion";
import "./projectImage.css";

gsap.registerPlugin(ScrollTrigger);

const TRIGGER_PROGRESS = 0.4; // fire once the project has scrolled 40% through

/**
 * A project photograph that begins fully desaturated. Once the viewer
 * has scrolled it 40% of the way through its on-screen transit, a drop
 * of pigment falls, stretching with speed as it accelerates, and lands
 * right at the image's top edge. The instant it lands, a real
 * ink-in-water clip begins driving the diffusion — no gap between
 * impact and spread — running on its own physical clock (a couple of
 * seconds, sped up from the source clip) rather than being tied to
 * further scroll input. When the clip ends, the reveal simply freezes
 * on that last frame rather than snapping to a plain full-color image.
 *
 * This plays exactly once per visit and is never reset or replayed —
 * scrolling back and forth over it does nothing further. That's a
 * deliberate simplification: the previous version re-armed itself on
 * scroll-up and replayed on scroll-down again, which meant a quick
 * scroll near the trigger point could restart the video mid-seek and
 * produce a visible flash/flicker. One clean playthrough is worth
 * more than a repeatable one that can glitch.
 */
function ProjectImage({ project, dropOrigin = 0.015 }) {
  const wrapRef = useRef(null);
  const frameRef = useRef(null);
  const colorImgRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const dropRef = useRef(null);
  const rippleRef = useRef(null);
  const inkRef = useRef(null);
  const firedRef = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const frame = frameRef.current;
    if (!wrap || !frame) return;

    if (reducedMotion) {
      const io = new IntersectionObserver(
        ([entry]) => entry.isIntersecting && wrap.classList.add("is-revealed-static"),
        { threshold: 0.3 }
      );
      io.observe(wrap);
      return () => io.disconnect();
    }

    const canvas = canvasRef.current;
    const colorImg = colorImgRef.current;
    const video = videoRef.current;

    const resize = () => {
      const rect = frame.getBoundingClientRect();
      if (inkRef.current) {
        inkRef.current.resize(rect.width, rect.height, window.devicePixelRatio || 1);
        // Re-paint immediately so a resize after the reveal has already
        // frozen doesn't leave the canvas blank.
        inkRef.current.renderCurrentFrame();
      } else {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(frame);

    const runDropAndDiffuse = () => {
      const rect = frame.getBoundingClientRect();
      const dropRestY = rect.height * dropOrigin;

      const beginDiffusion = () => {
        if (!video) {
          gsap.to(colorImg, { opacity: 1, duration: 0.6, ease: "power1.out" });
          return;
        }
        const ink = new VideoInkDiffusion({
          canvas,
          video,
          colorImage: colorImg,
          targetDuration: 2400 + Math.random() * 500,
        });
        inkRef.current = ink;
        resize();
        // Only reveal the canvas once VideoInkDiffusion confirms the
        // video is genuinely sitting at frame 0 and the canvas has
        // been cleared — this is what prevents a stale final frame
        // from a hypothetical prior run flashing on screen.
        ink.start(() => {
          canvas.style.opacity = "1";
        });
      };

      gsap.set(dropRef.current, { opacity: 1 });
      gsap
        .timeline()
        .fromTo(
          dropRef.current,
          { y: -Math.min(110, rect.height * 0.24), scaleX: 1, scaleY: 1, opacity: 1 },
          {
            y: dropRestY,
            scaleY: 1.32,
            scaleX: 0.82,
            duration: 0.42,
            ease: "power2.in",
          }
        )
        // Impact squash and the diffusion start fire in the same instant —
        // the fall's energy visibly "becomes" the spreading ink.
        .to(dropRef.current, { scaleX: 0.5, scaleY: 1.85, duration: 0.07, ease: "power1.out" })
        .call(beginDiffusion, null, "<")
        .call(
          () => {
            gsap.fromTo(
              rippleRef.current,
              { attr: { r: 2 }, opacity: 0.55 },
              { attr: { r: rect.width * 0.22 }, opacity: 0, duration: 0.9, ease: "power2.out" }
            );
          },
          null,
          "<"
        )
        .to(dropRef.current, { scaleX: 1.25, scaleY: 0.35, opacity: 0, duration: 0.16, ease: "power2.out" });
    };

    gsap.set(dropRef.current, { xPercent: -50, opacity: 0, y: -80, scaleX: 1, scaleY: 1 });
    gsap.set(colorImg, { opacity: 0 });
    gsap.set(canvas, { opacity: 0 });
    gsap.set(rippleRef.current, { attr: { r: 0 }, opacity: 0 });

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: "top 95%",
      end: "top 15%",
      onUpdate: (self) => {
        if (!firedRef.current && self.progress >= TRIGGER_PROGRESS) {
          firedRef.current = true;
          runDropAndDiffuse();
        }
      },
    });

    return () => {
      trigger.kill();
      ro.disconnect();
      inkRef.current?.cancel();
    };
  }, [dropOrigin, project.id, reducedMotion]);

  return (
    <div className="project-image" ref={wrapRef} style={{ "--project-color": project.color }}>
      <div className="project-image__frame" ref={frameRef}>
        <img
          src={project.image}
          alt={`${project.title} — ${project.tagline}`}
          className="project-image__layer project-image__layer--mono"
          loading="lazy"
          decoding="async"
        />
        <canvas ref={canvasRef} className="project-image__canvas" aria-hidden="true" />
        <img
          ref={colorImgRef}
          src={project.image}
          alt=""
          aria-hidden="true"
          className="project-image__layer project-image__layer--color"
          loading="lazy"
          decoding="async"
        />

        {!reducedMotion && project.inkVideo && (
          <video
            ref={videoRef}
            className="project-image__source-video"
            src={project.inkVideo}
            muted
            playsInline
            preload="none"
            aria-hidden="true"
          />
        )}

        {!reducedMotion && (
          <>
            <div ref={dropRef} className="project-image__drop" aria-hidden="true">
              <svg viewBox="0 0 24 32" width="16" height="22">
                <path
                  d="M12 0C12 0 2 14 2 21a10 10 0 0 0 20 0C22 14 12 0 12 0Z"
                  fill={project.color}
                />
              </svg>
            </div>
            <svg className="project-image__ripple" aria-hidden="true">
              <circle
                ref={rippleRef}
                cx="50%"
                cy={`${dropOrigin * 100}%`}
                r="0"
                fill="none"
                stroke={project.color}
                strokeWidth="1.5"
                opacity="0"
              />
            </svg>
          </>
        )}
      </div>
    </div>
  );
}

export default ProjectImage;
