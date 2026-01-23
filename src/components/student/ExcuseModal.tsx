"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Calendar,
    FileText,
    Loader2,
    Check,
    AlertCircle,
} from "lucide-react";
import { useAttendance, formatDateKey } from "@/lib/hooks/useAttendance";
import { modalOverlay, modalContent } from "@/lib/motion";

interface ExcuseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    circleId: string;
    initialDate?: string;
}

export default function ExcuseModal({
    isOpen,
    onClose,
    onSuccess,
    circleId,
    initialDate,
}: ExcuseModalProps) {
    const [date, setDate] = useState(initialDate || formatDateKey(new Date()));
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

    const { submitExcuse, error } = useAttendance(circleId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim()) {
            setSubmitResult({ success: false, message: "الرجاء كتابة سبب العذر" });
            return;
        }

        setIsSubmitting(true);
        setSubmitResult(null);

        const success = await submitExcuse(date, reason.trim());

        if (success) {
            setSubmitResult({ success: true, message: "تم تقديم العذر بنجاح" });
            setTimeout(() => {
                setReason("");
                setSubmitResult(null);
                onSuccess();
            }, 1500);
        } else {
            setSubmitResult({ success: false, message: error || "فشل في تقديم العذر" });
        }

        setIsSubmitting(false);
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setReason("");
            setSubmitResult(null);
            onClose();
        }
    };

    // Format date for display
    const formatDisplayDate = (dateKey: string) => {
        const dateObj = new Date(dateKey + "T00:00:00");
        return dateObj.toLocaleDateString("ar-SA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Get max date (today)
    const today = formatDateKey(new Date());

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        variants={modalOverlay}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={handleClose}
                        className="absolute inset-0 bg-emerald-deep/50 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        variants={modalContent}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-md bg-surface rounded-2xl shadow-elevated border border-border overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-bold text-emerald-deep flex items-center gap-2">
                                <FileText size={20} className="text-gold" />
                                تقديم عذر
                            </h2>
                            <button
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="p-2 text-text-muted hover:bg-sand rounded-lg transition-colors disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Date Picker */}
                            <div>
                                <label className="block text-sm font-medium text-emerald-deep mb-2">
                                    تاريخ الغياب
                                </label>
                                <div className="relative">
                                    <Calendar
                                        size={18}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                                    />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        max={today}
                                        className="w-full pr-10 pl-4 py-3 bg-sand border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald text-emerald-deep"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-1">
                                    {formatDisplayDate(date)}
                                </p>
                            </div>

                            {/* Reason Textarea */}
                            <div>
                                <label className="block text-sm font-medium text-emerald-deep mb-2">
                                    سبب العذر
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="اكتب سبب غيابك هنا..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-sand border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald text-emerald-deep placeholder:text-text-muted resize-none"
                                    required
                                />
                                <p className="text-xs text-text-muted mt-1 text-left">
                                    {reason.length}/500
                                </p>
                            </div>

                            {/* Submit Result */}
                            <AnimatePresence>
                                {submitResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`p-3 rounded-xl flex items-center gap-2 ${submitResult.success
                                                ? "bg-emerald/10 text-emerald"
                                                : "bg-red-50 text-red-500"
                                            }`}
                                    >
                                        {submitResult.success ? (
                                            <Check size={18} />
                                        ) : (
                                            <AlertCircle size={18} />
                                        )}
                                        <span className="text-sm">{submitResult.message}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="flex-1 btn-secondary disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !reason.trim()}
                                    className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>جاري الإرسال...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            <span>تقديم العذر</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
