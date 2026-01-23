import { Variants } from "framer-motion";

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// Viewport config for scroll-triggered animations
export const viewportConfig = {
    once: true,
    margin: "-50px",
};

// Scale up animation
export const scaleUp: Variants = {
    hidden: {
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 0.9,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

// Page transition
export const pageTransition: Variants = {
    hidden: {
        opacity: 0,
        y: prefersReducedMotion ? 0 : 10,
        filter: prefersReducedMotion ? "none" : "blur(4px)",
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: prefersReducedMotion ? 0 : -10,
        transition: { duration: 0.3 },
    },
};

// Stagger container for child animations
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: prefersReducedMotion ? 0 : 0.08,
            delayChildren: 0.1,
        },
    },
};

// Fade up animation for items
export const fadeUp: Variants = {
    hidden: {
        opacity: 0,
        y: prefersReducedMotion ? 0 : 16,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

// List item animation
export const listItem: Variants = {
    hidden: {
        opacity: 0,
        x: prefersReducedMotion ? 0 : -12,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

// Button motion
export const buttonMotion = {
    rest: { scale: 1 },
    hover: {
        y: prefersReducedMotion ? 0 : -1,
        transition: { duration: 0.2 }
    },
    tap: {
        scale: prefersReducedMotion ? 1 : 0.98,
        transition: { duration: 0.1 }
    },
};

// Card hover effect
export const cardHover: Variants = {
    rest: {
        y: 0,
        boxShadow: "0 4px 6px -1px rgba(15, 61, 46, 0.08)",
    },
    hover: {
        y: prefersReducedMotion ? 0 : -2,
        boxShadow: "0 10px 15px -3px rgba(15, 61, 46, 0.1), 0 0 0 1px rgba(199, 161, 74, 0.1)",
        transition: { duration: 0.2 },
    },
};

// Modal animation
export const modalOverlay: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 }
    },
};

export const modalContent: Variants = {
    hidden: {
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 0.95,
        y: prefersReducedMotion ? 0 : 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 0.98,
        transition: { duration: 0.2 },
    },
};

// Progress ring draw animation
export const progressRing = {
    hidden: { pathLength: 0 },
    visible: (progress: number) => ({
        pathLength: progress,
        transition: {
            duration: prefersReducedMotion ? 0 : 1.2,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};

// Skeleton pulse
export const skeletonPulse: Variants = {
    initial: { opacity: 0.4 },
    animate: {
        opacity: [0.4, 0.7, 0.4],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

// Toast animation
export const toastMotion: Variants = {
    hidden: {
        opacity: 0,
        y: prefersReducedMotion ? 0 : 20,
        scale: prefersReducedMotion ? 1 : 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: prefersReducedMotion ? 0 : -10,
        scale: prefersReducedMotion ? 1 : 0.95,
        transition: { duration: 0.2 },
    },
};

// Number count up helper
export const countUp = (end: number, duration: number = 1000) => {
    return {
        from: 0,
        to: end,
        duration: prefersReducedMotion ? 0 : duration,
    };
};
