import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                sand: "#F6F1E7",
                surface: "#FFFCF6",
                emerald: {
                    DEFAULT: "#0F3D2E",
                    deep: "#0A2A20",
                },
                gold: "#C7A14A",
                border: "rgba(15,61,46,0.12)",
                text: {
                    DEFAULT: "#0B1220",
                    muted: "rgba(11,18,32,0.65)",
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
