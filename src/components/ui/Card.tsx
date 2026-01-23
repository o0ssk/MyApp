"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cardHover } from "@/lib/motion";

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: "default" | "gradient" | "gold";
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = "", variant = "default", hover = false, onClick }: CardProps) {
    const baseClasses = "rounded-[18px] p-6 border transition-all duration-200";

    const variantClasses = {
        default: "bg-surface border-border shadow-soft",
        gradient: "bg-gradient-to-br from-surface to-sand border-border shadow-soft",
        gold: "bg-surface border-gold/20 shadow-glow",
    };

    const Component = hover ? motion.div : "div";
    const motionProps = hover ? {
        variants: cardHover,
        initial: "rest",
        whileHover: "hover",
    } : {};

    return (
        <Component
            className={`${baseClasses} ${variantClasses[variant]} ${onClick ? "cursor-pointer" : ""} ${className}`}
            onClick={onClick}
            {...motionProps}
        >
            {children}
        </Component>
    );
}

interface CardHeaderProps {
    children?: ReactNode;
    className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
    return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: CardHeaderProps) {
    return <h3 className={`text-lg font-bold text-emerald-deep ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = "" }: CardHeaderProps) {
    return <div className={className}>{children}</div>;
}
