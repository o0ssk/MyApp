"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { pageTransition, staggerContainer } from "@/lib/motion";

interface PageShellProps {
    children: ReactNode;
    className?: string;
}

export function PageShell({ children, className = "" }: PageShellProps) {
    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`min-h-screen bg-sand ornament-bg ${className}`}
        >
            {children}
        </motion.div>
    );
}

interface PageHeaderProps {
    children: ReactNode;
    className?: string;
}

export function PageHeader({ children, className = "" }: PageHeaderProps) {
    return (
        <header className={`sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border ${className}`}>
            <div className="max-w-5xl mx-auto px-4 py-4">
                {children}
            </div>
        </header>
    );
}

interface PageContentProps {
    children: ReactNode;
    className?: string;
}

export function PageContent({ children, className = "" }: PageContentProps) {
    return (
        <motion.main
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className={`max-w-5xl mx-auto px-4 py-6 ${className}`}
        >
            {children}
        </motion.main>
    );
}
