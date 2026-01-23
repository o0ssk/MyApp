"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, RotateCcw, Calendar, Clock, Edit3, Save } from "lucide-react";
import { Log } from "@/lib/hooks/useLogs";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { modalOverlay, modalContent } from "@/lib/motion";

interface LogDetailsDrawerProps {
    log: Log | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateNotes: (logId: string, notes: string) => Promise<{ success: boolean; error?: string }>;
}

export function LogDetailsDrawer({ log, isOpen, onClose, onUpdateNotes }: LogDetailsDrawerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when log changes
    const handleOpen = () => {
        if (log) {
            setNotes(log.studentNotes || "");
            setIsEditing(false);
            setError(null);
        }
    };

    const handleSaveNotes = async () => {
        if (!log) return;
        setIsSaving(true);
        setError(null);

        const result = await onUpdateNotes(log.id, notes);

        setIsSaving(false);
        if (result.success) {
            setIsEditing(false);
        } else {
            setError(result.error || "فشل في حفظ الملاحظات");
        }
    };

    if (!log) return null;

    const amountText = log.amount.pages
        ? `${log.amount.pages} صفحة`
        : `${log.amount.surah} (الآيات ${log.amount.ayahFrom}-${log.amount.ayahTo})`;

    return (
        <AnimatePresence onExitComplete={() => setIsEditing(false)}>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-end">
                    {/* Overlay */}
                    <motion.div
                        variants={modalOverlay}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="absolute inset-0 bg-emerald-deep/50 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        onAnimationComplete={handleOpen}
                        className="relative h-full w-full max-w-md bg-surface shadow-xl border-r border-border overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-surface z-10 flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-bold text-emerald-deep">تفاصيل السجل</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-text-muted hover:text-emerald hover:bg-sand rounded-lg transition-colors"
                                aria-label="إغلاق"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Type & Status */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${log.type === "memorization"
                                                ? "bg-gold/10 text-gold"
                                                : "bg-emerald/10 text-emerald"
                                            }`}
                                    >
                                        {log.type === "memorization" ? (
                                            <BookOpen size={24} />
                                        ) : (
                                            <RotateCcw size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-emerald-deep">
                                            {log.type === "memorization" ? "حفظ" : "مراجعة"}
                                        </div>
                                        <div className="text-sm text-text-muted">{amountText}</div>
                                    </div>
                                </div>
                                <StatusBadge status={log.status} />
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-sand rounded-xl">
                                    <div className="flex items-center gap-2 text-text-muted mb-1">
                                        <Calendar size={16} />
                                        <span className="text-sm">التاريخ</span>
                                    </div>
                                    <div className="font-medium text-emerald-deep">
                                        {new Date(log.date).toLocaleDateString("ar-SA", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </div>
                                </div>
                                <div className="p-4 bg-sand rounded-xl">
                                    <div className="flex items-center gap-2 text-text-muted mb-1">
                                        <Clock size={16} />
                                        <span className="text-sm">وقت الإنشاء</span>
                                    </div>
                                    <div className="font-medium text-emerald-deep">
                                        {log.createdAt.toLocaleTimeString("ar-SA", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Student Notes */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-emerald-deep">
                                        ملاحظاتك
                                    </label>
                                    {!isEditing && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Edit3 size={14} />
                                            تعديل
                                        </Button>
                                    )}
                                </div>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="أضف ملاحظاتك..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text resize-none focus:outline-none focus:ring-2 focus:ring-gold/50"
                                        />
                                        {error && <p className="text-red-500 text-sm">{error}</p>}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="gold"
                                                size="sm"
                                                onClick={handleSaveNotes}
                                                isLoading={isSaving}
                                            >
                                                <Save size={14} />
                                                حفظ
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setNotes(log.studentNotes || "");
                                                }}
                                            >
                                                إلغاء
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-sand rounded-xl min-h-[60px]">
                                        {log.studentNotes ? (
                                            <p className="text-text">{log.studentNotes}</p>
                                        ) : (
                                            <p className="text-text-muted">لا توجد ملاحظات</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Teacher Notes (Read Only) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-emerald-deep">
                                    ملاحظات الشيخ
                                </label>
                                <div className="p-4 bg-emerald/5 rounded-xl border border-emerald/10 min-h-[60px]">
                                    {log.teacherNotes ? (
                                        <p className="text-text">{log.teacherNotes}</p>
                                    ) : (
                                        <p className="text-text-muted">لا توجد ملاحظات من الشيخ</p>
                                    )}
                                </div>
                            </div>

                            {/* Updated At */}
                            {log.updatedAt && (
                                <div className="text-xs text-text-muted text-center">
                                    آخر تحديث: {log.updatedAt.toLocaleString("ar-SA")}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
