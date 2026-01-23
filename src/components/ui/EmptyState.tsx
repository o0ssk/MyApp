"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Button } from "./Button";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
        >
            <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mb-6 text-text-muted">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-emerald-deep mb-2">{title}</h3>
            <p className="text-text-muted mb-6 max-w-sm">{description}</p>
            {action && (
                <Button variant="gold" onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </motion.div>
    );
}
