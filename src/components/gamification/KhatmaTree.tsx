"use client";

import { motion } from "framer-motion";
import { Leaf, Sprout, TreePine, Award, Trophy } from "lucide-react";

interface KhatmaTreeProps {
    completedPages: number;
    totalPoints: number;
}

export function KhatmaTree({ completedPages, totalPoints }: KhatmaTreeProps) {
    const percentage = Math.min(100, Math.max(0, (completedPages / 604) * 100));

    // Determine Stage
    const getStage = (pct: number) => {
        if (pct >= 100) return {
            icon: <Trophy size={48} className="text-gold" />,
            label: "الختمة المباركة",
            color: "text-gold",
            bg: "bg-gold/10"
        };
        if (pct >= 50) return {
            icon: <TreePine size={48} className="text-emerald-deep" />,
            label: "شجرة وارفة",
            color: "text-emerald-deep",
            bg: "bg-emerald/20"
        };
        if (pct >= 25) return {
            icon: <TreePine size={48} className="text-emerald" />,
            label: "شجرة نامية",
            color: "text-emerald",
            bg: "bg-emerald/10"
        };
        if (pct >= 5) return {
            icon: <Sprout size={48} className="text-emerald" />,
            label: "نبتة فتية",
            color: "text-emerald",
            bg: "bg-emerald/10"
        };
        if (pct > 0) return {
            icon: <Sprout size={48} className="text-emerald/70" />,
            label: "بداية الغراس",
            color: "text-emerald/80",
            bg: "bg-emerald/5"
        };
        return {
            icon: <Leaf size={48} className="text-text-muted" />,
            label: "بذرة النية",
            color: "text-text-muted",
            bg: "bg-gray-100"
        };
    };

    const stage = getStage(percentage);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-white rounded-xl border border-border p-6 shadow-sm overflow-hidden relative"
        >
            {/* Background Pattern Decoration */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

            <div className="flex items-center gap-6 relative z-10">
                {/* Icon Container */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${stage.bg} shadow-inner`}>
                    {stage.icon}
                </div>

                {/* Progress Info */}
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h3 className={`text-lg font-bold ${stage.color}`}>{stage.label}</h3>
                            <p className="text-sm text-text-muted">
                                {completedPages} من 604 صفحة
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-emerald-deep">{percentage.toFixed(1)}%</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-emerald to-emerald-deep rounded-full relative"
                        >
                            {/* Shine effect */}
                            <div className="absolute top-0 left-0 w-full h-full bg-white/20" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
