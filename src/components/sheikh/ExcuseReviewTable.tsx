"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Check,
    X,
    Loader2,
    Calendar,
    User,
    AlertCircle,
    Clock,
    RefreshCw,
} from "lucide-react";
import { useAttendance, Excuse } from "@/lib/hooks/useAttendance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { useToast } from "@/components/ui/Toast";
import { fadeUp, staggerContainer, listItem } from "@/lib/motion";

interface ExcuseReviewTableProps {
    circleId: string;
}

const EXCUSE_STATUS_CONFIG = {
    pending: { label: "قيد المراجعة", color: "bg-amber-100 text-amber-700", icon: Clock },
    approved: { label: "مقبول", color: "bg-emerald-100 text-emerald-700", icon: Check },
    rejected: { label: "مرفوض", color: "bg-red-100 text-red-700", icon: X },
};

export default function ExcuseReviewTable({ circleId }: ExcuseReviewTableProps) {
    const [excuses, setExcuses] = useState<Excuse[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const { isLoading, error, fetchPendingExcuses, processExcuse } = useAttendance(circleId);
    const { showToast } = useToast();

    const loadExcuses = useCallback(async () => {
        const data = await fetchPendingExcuses();
        setExcuses(data);
    }, [fetchPendingExcuses]);

    useEffect(() => {
        loadExcuses();
    }, [loadExcuses]);

    const handleProcess = async (excuseId: string, action: "approved" | "rejected") => {
        setProcessingId(excuseId);
        const success = await processExcuse(excuseId, action);
        setProcessingId(null);

        if (success) {
            showToast(
                action === "approved" ? "تم قبول العذر وتحديث الحضور" : "تم رفض العذر",
                action === "approved" ? "success" : "error"
            );
            loadExcuses(); // Refresh list
        } else {
            showToast("فشل في معالجة العذر", "error");
        }
    };

    const formatDate = (dateKey: string) => {
        const date = new Date(dateKey + "T00:00:00");
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        if (dateKey === today) return "اليوم";
        if (dateKey === yesterday) return "أمس";

        return date.toLocaleDateString("ar-SA", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText size={20} className="text-gold" />
                        الأعذار المقدمة
                        {excuses.length > 0 && (
                            <span className="bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {excuses.length}
                            </span>
                        )}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadExcuses}
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {/* Loading State */}
                {isLoading && excuses.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-emerald animate-spin" />
                        <span className="mr-3 text-text-muted">جاري التحميل...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && excuses.length === 0 && (
                    <EmptyState
                        icon={<Check size={40} className="text-emerald" />}
                        title="لا توجد أعذار قيد المراجعة"
                        description="جميع الأعذار تم معالجتها"
                    />
                )}

                {/* Excuses List */}
                {!isLoading && excuses.length > 0 && (
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {excuses.map((excuse) => (
                            <motion.div
                                key={excuse.id}
                                variants={listItem}
                                className="bg-sand/50 rounded-2xl p-4 border border-border hover:border-gold/30 transition-colors"
                            >
                                {/* Header Row */}
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <StudentAvatar
                                            student={{
                                                name: excuse.studentName || "طالب",
                                            }}
                                            size="sm"
                                        />
                                        <div>
                                            <h4 className="font-bold text-emerald-deep">
                                                {excuse.studentName || "طالب"}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                                <Calendar size={12} />
                                                <span>{formatDate(excuse.date)}</span>
                                                <span className="text-gray-300">|</span>
                                                <span dir="ltr">{excuse.date}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${EXCUSE_STATUS_CONFIG[excuse.status].color}`}>
                                        {(() => {
                                            const Icon = EXCUSE_STATUS_CONFIG[excuse.status].icon;
                                            return <Icon size={12} />;
                                        })()}
                                        {EXCUSE_STATUS_CONFIG[excuse.status].label}
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="bg-surface rounded-xl p-3 mb-4">
                                    <p className="text-sm text-emerald-deep leading-relaxed">
                                        {excuse.reason}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                {excuse.status === "pending" && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleProcess(excuse.id, "approved")}
                                            disabled={processingId === excuse.id}
                                        >
                                            {processingId === excuse.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Check size={16} />
                                            )}
                                            قبول
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleProcess(excuse.id, "rejected")}
                                            disabled={processingId === excuse.id}
                                        >
                                            {processingId === excuse.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <X size={16} />
                                            )}
                                            رفض
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}
