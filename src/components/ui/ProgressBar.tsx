"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
    value: number; // Current value
    max: number; // Target value
    label?: string;
    showPercentage?: boolean;
    color?: "emerald" | "gold" | "blue" | "purple";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function ProgressBar({
    value,
    max,
    label,
    showPercentage = true,
    color = "emerald",
    size = "md",
    className = "",
}: ProgressBarProps) {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    const isComplete = value >= max && max > 0;

    const colorClasses = {
        emerald: "bg-emerald",
        gold: "bg-gold",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
    };

    const bgColorClasses = {
        emerald: "bg-emerald/10",
        gold: "bg-gold/10",
        blue: "bg-blue-100",
        purple: "bg-purple-100",
    };

    const sizeClasses = {
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Label and Value */}
            {(label || showPercentage) && (
                <div className="flex items-center justify-between mb-2">
                    {label && (
                        <span className="text-sm font-medium text-emerald-deep">{label}</span>
                    )}
                    <div className="flex items-center gap-2">
                        {isComplete && (
                            <span className="text-lg" role="img" aria-label="completed">
                                🎉
                            </span>
                        )}
                        {showPercentage && (
                            <span className="text-sm font-bold text-text-muted">
                                {value} / {max}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Progress Track */}
            <div
                className={`w-full ${sizeClasses[size]} ${bgColorClasses[color]} rounded-full overflow-hidden`}
            >
                <motion.div
                    className={`h-full ${colorClasses[color]} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}
