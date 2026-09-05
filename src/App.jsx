import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import Hero from "./sections/hero/Hero";
import Projects from "./sections/projects/Projects";
import About from "./sections/about/About";
import Experience from "./sections/experience/Experience";
import Contact from "./sections/contact/Contact";
import Cursor from "./components/Cursor";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar/Navbar";
import VeinField from "./components/Liquid/VeinField";
import useReducedMotion from "./hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return undefined;

    // Smooth, weighted scrolling (cinematic feel) — driven through
    // ScrollTrigger so every scrub-based animation in the site stays in
    // sync with Lenis's eased scroll position rather than native scroll.
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      // Touch input uses native scroll unless `syncTouch` is explicitly
      // enabled — this simply keeps that (correct) default explicit.
      syncTouch: false,
    });

    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      window.__lenis = null;
    };
  }, [reducedMotion]);

  return (
    <>
      <Loader />
      <VeinField />
      <Navbar />
      <Cursor />

      <div id="top">
        {/* Opening scene: entering the world */}
        <Hero />

        {/* Discovering the world */}
        <Projects />

        {/* Understanding the person behind the work */}
        <About />
        <Experience />

        {/* Leaving the world */}
        <Contact />
      </div>
    </>
  );
}

export default App;