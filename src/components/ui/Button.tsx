"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { buttonMotion } from "@/lib/motion";
import { Loader2 } from "lucide-react";

interface ButtonProps {
    children: ReactNode;
    variant?: "primary" | "secondary" | "gold" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit";
    onClick?: () => void;
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled = false,
    className = "",
    type = "button",
    onClick,
}: ButtonProps) {
    const baseClasses = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: "bg-emerald text-white hover:bg-emerald-deep",
        secondary: "bg-transparent text-emerald border border-emerald/20 hover:bg-emerald/5",
        gold: "bg-gold text-white hover:brightness-110",
        ghost: "bg-transparent text-text-muted hover:bg-sand hover:text-emerald",
        danger: "bg-red-500 text-white hover:bg-red-600",
    };

    const sizeClasses = {
        sm: "px-3 py-2 text-sm",
        md: "px-5 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            variants={buttonMotion}
            initial="rest"
            whileHover={disabled ? undefined : "hover"}
            whileTap={disabled ? undefined : "tap"}
            type={type}
            disabled={disabled || isLoading}
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </motion.button>
    );
}
