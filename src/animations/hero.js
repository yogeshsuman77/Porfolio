import gsap from "gsap";

export const animateHeroIntro = ({
  bgText,
  avatar,
  heading,
  descriptionContainer,
  description,
  bottomFade,
}) => {
  const tl = gsap.timeline({
    defaults: {
      ease: "power3.out",
    },
  });

  // Initial states (VERY IMPORTANT)
  gsap.set(bgText, {
    opacity: 0,
    scale: 1.08,
  });

  gsap.set(avatar, {
    opacity: 0,
    scale: 0.98,
    filter: "blur(6px)",
  });

  gsap.set(heading, {
    opacity: 0,
    y: 20,
  });

  gsap.set(bottomFade, {
    opacity: 0,
  });

  gsap.set(descriptionContainer, {
    opacity: 0,
  });
  gsap.set(description, {
    opacity: 0,
    x: 20,
  });

  // Timeline
  tl.to(bgText, {
    opacity: 1,
    scale: 1,
    duration: 1.4,
  })

    // Avatar comes into focus
    .to(
      avatar,
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.5,
      },
      "-=0.8"
    )

    // Heading reveal (intentional delay)
    .to(
      heading,
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
      },
      "-=1.2"
    )

    .to(
      descriptionContainer,
      {
        opacity: 1,
        duration: 1
      },
      "-=1"
    )

    // Description last (quiet confidence)
    .to(
      description,
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
      },
      "-=0.6"
    )

    // Bottom vignette settles in last, grounding the composition
    .to(
      bottomFade,
      {
        opacity: 1,
        duration: 1.2,
      },
      "-=0.6"
    );

  return tl;
};