import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dynamic colors (will change with theme)
                background: "rgb(var(--background) / <alpha-value>)",
                foreground: "rgb(var(--foreground) / <alpha-value>)",

                // Light theme colors
                sand: "rgb(var(--sand) / <alpha-value>)",
                surface: "rgb(var(--surface) / <alpha-value>)",
                emerald: {
                    DEFAULT: "rgb(var(--emerald) / <alpha-value>)",
                    deep: "rgb(var(--emerald-deep) / <alpha-value>)",
                },
                gold: "rgb(var(--gold) / <alpha-value>)",
                border: "rgb(var(--border) / <alpha-value>)",
                text: {
                    DEFAULT: "rgb(var(--foreground) / <alpha-value>)",
                    muted: "rgb(var(--text-muted) / <alpha-value>)",
                },
                // Status Colors
                success: "#16A34A",
                warning: "#EAB308",
                error: "#DC2626",
                info: "#0EA5E9",
            },
            fontFamily: {
                tajawal: ["Tajawal", "sans-serif"],
            },
            borderRadius: {
                xl: "18px",
                "2xl": "24px",
            },
            boxShadow: {
                soft: "0 4px 24px rgba(15,61,46,0.08)",
                elevated: "0 8px 32px rgba(15,61,46,0.12)",
                glow: "0 0 20px rgba(199,161,74,0.15)",
            },
        },
    },
    plugins: [],
};
export default config;
