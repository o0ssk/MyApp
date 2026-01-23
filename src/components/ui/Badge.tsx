"use client";

import { ReactNode } from "react";

interface BadgeProps {
    children: ReactNode;
    variant?: "default" | "success" | "warning" | "error" | "info" | "pending";
    size?: "sm" | "md";
    className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className = "" }: BadgeProps) {
    const baseClasses = "inline-flex items-center gap-1 font-medium rounded-full";

    const variantClasses = {
        default: "bg-sand text-text-muted",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        error: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
        pending: "bg-amber-100 text-amber-700",
    };

    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
            {children}
        </span>
    );
}

// Status-specific badges
export function StatusBadge({ status }: { status: string }) {
    const statusMap: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
        pending: { label: "قيد الانتظار", variant: "pending" },
        pending_approval: { label: "قيد المراجعة", variant: "pending" },
        approved: { label: "مقبول", variant: "success" },
        submitted: { label: "مُرسل", variant: "info" },
        missed: { label: "فائت", variant: "error" },
        rejected: { label: "مرفوض", variant: "error" },
    };

    const config = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}
