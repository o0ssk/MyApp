"use client";

import { motion } from "framer-motion";
import { skeletonPulse } from "@/lib/motion";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "circle" | "card";
}

export function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
    const variantClasses = {
        text: "h-4 rounded",
        circle: "rounded-full",
        card: "h-32 rounded-xl",
    };

    return (
        <motion.div
            variants={skeletonPulse}
            initial="initial"
            animate="animate"
            className={`bg-border/50 ${variantClasses[variant]} ${className}`}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-surface rounded-[18px] p-6 border border-border">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circle" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="w-1/2" />
                    <Skeleton className="w-1/3" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="w-full" />
                <Skeleton className="w-4/5" />
            </div>
        </div>
    );
}

export function StatSkeleton() {
    return (
        <div className="bg-surface rounded-[18px] p-6 border border-border">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="w-20" />
                    <Skeleton className="w-16 h-8" />
                </div>
                <Skeleton variant="circle" className="w-16 h-16" />
            </div>
        </div>
    );
}
