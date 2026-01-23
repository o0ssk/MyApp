"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { progressRing } from "@/lib/motion";

interface ProgressRingProps {
    progress: number; // 0 to 1
    size?: number;
    strokeWidth?: number;
    showPercentage?: boolean;
    label?: string;
    className?: string;
}

export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 8,
    showPercentage = true,
    label,
    className = "",
}: ProgressRingProps) {
    const [animatedValue, setAnimatedValue] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const center = size / 2;

    useEffect(() => {
        const duration = 1200;
        const start = Date.now();
        const animate = () => {
            const elapsed = Date.now() - start;
            const p = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setAnimatedValue(Math.round(progress * 100 * eased));
            if (p < 1) requestAnimationFrame(animate);
        };
        animate();
    }, [progress]);

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-border"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className="text-gold"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference * (1 - progress) }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showPercentage && (
                    <span className="text-2xl font-bold text-emerald-deep">{animatedValue}%</span>
                )}
                {label && <span className="text-xs text-text-muted mt-1">{label}</span>}
            </div>
        </div>
    );
}
