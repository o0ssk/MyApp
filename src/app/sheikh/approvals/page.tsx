"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardCheck,
    BookOpen,
    Calendar,
    FileText,
    Check,
    X,
    Loader2,
    ChevronLeft,
} from "lucide-react";

import { useSheikhCircles, usePendingLogs, PendingLog } from "@/lib/hooks/useSheikh";
import { useToast } from "@/components/ui/Toast";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { staggerContainer, fadeUp, listItem } from "@/lib/motion";

export default function ApprovalsPage() {
    const { circles, isLoading: circlesLoading } = useSheikhCircles();
    const circleIds = useMemo(() => circles.map((c) => c.id), [circles]);
    const { logs, isLoading: logsLoading, error, approveLog, rejectLog } = usePendingLogs(circleIds);
    const { showToast } = useToast();

    const [selectedLog, setSelectedLog] = useState<PendingLog | null>(null);

    const isLoading = circlesLoading || logsLoading;

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6"
            >
                <h1 className="text-2xl font-bold text-emerald-deep">المراجعات</h1>
                <p className="text-text-muted">
                    {logs.length > 0
                        ? `${logs.length} سجل بانتظار المراجعة`
                        : "مراجعة سجلات الطلاب"}
                </p>
            </motion.div>

            {/* Loading */}
            {isLoading && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="h-24" />
                        </Card>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && !isLoading && (
                <Card>
                    <EmptyState
                        icon={<ClipboardCheck size={40} />}
                        title="خطأ في التحميل"
                        description={error}
                    />
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && logs.length === 0 && (
                <Card>
                    <EmptyState
                        icon={<ClipboardCheck size={40} />}
                        title="لا توجد سجلات معلقة"
                        description="تظهر هنا سجلات الطلاب التي تحتاج لمراجعتك"
                    />
                </Card>
            )}

            {/* Logs List */}
            {!isLoading && !error && logs.length > 0 && (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {logs.map((log) => (
                        <motion.div key={log.id} variants={listItem}>
                            <LogCard log={log} onClick={() => setSelectedLog(log)} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Approval Drawer */}
            <AnimatePresence>
                {selectedLog && (
                    <ApprovalDrawer
                        log={selectedLog}
                        onClose={() => setSelectedLog(null)}
                        onApprove={approveLog}
                        onReject={rejectLog}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Log Card Component
function LogCard({ log, onClick }: { log: PendingLog; onClick: () => void }) {
    const circleName = log.circleId; // Could fetch, but use ID for now
    const typeLabel = log.type === "memorization" ? "حفظ" : "مراجعة";
    const typeColor =
        log.type === "memorization" ? "text-emerald bg-emerald/10" : "text-gold bg-gold/10";

    // Format amount
    let amountText = "";
    if (log.amount.pages) {
        amountText = `${log.amount.pages} صفحة`;
    } else if (log.amount.surah) {
        amountText = `سورة ${log.amount.surah}`;
        if (log.amount.ayahFrom && log.amount.ayahTo) {
            amountText += ` (${log.amount.ayahFrom} - ${log.amount.ayahTo})`;
        }
    }

    return (
        <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${typeColor}`}>
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-deep">
                                {log.studentName}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}>
                                {typeLabel}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-text-muted mt-1">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {log.date.toLocaleDateString("ar-SA")}
                            </span>
                            {amountText && (
                                <span className="flex items-center gap-1">
                                    <FileText size={14} />
                                    {amountText}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <ChevronLeft size={20} className="text-text-muted" />
            </CardContent>
        </Card>
    );
}

// Approval Drawer
function ApprovalDrawer({
    log,
    onClose,
    onApprove,
    onReject,
}: {
    log: PendingLog;
    onClose: () => void;
    onApprove: (logId: string, notes: string) => Promise<{ success: boolean; error?: string }>;
    onReject: (logId: string, notes: string) => Promise<{ success: boolean; error?: string }>;
}) {
    const { showToast } = useToast();
    const [teacherNotes, setTeacherNotes] = useState("");
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const typeLabel = log.type === "memorization" ? "حفظ" : "مراجعة";

    // Format amount
    let amountText = "";
    if (log.amount.pages) {
        amountText = `${log.amount.pages} صفحة`;
    } else if (log.amount.surah) {
        amountText = `سورة ${log.amount.surah}`;
        if (log.amount.ayahFrom && log.amount.ayahTo) {
            amountText += ` (${log.amount.ayahFrom} - ${log.amount.ayahTo})`;
        }
    }

    const handleApprove = async () => {
        if (!teacherNotes.trim()) {
            showToast("يرجى إضافة ملاحظة", "error");
            return;
        }
        setIsApproving(true);
        const result = await onApprove(log.id, teacherNotes.trim());
        setIsApproving(false);
        if (result.success) {
            showToast("تم اعتماد السجل بنجاح", "success");
            onClose();
        } else {
            showToast(result.error || "فشل في اعتماد السجل", "error");
        }
    };

    const handleReject = async () => {
        if (!teacherNotes.trim()) {
            showToast("يرجى إضافة سبب الرفض", "error");
            return;
        }
        setIsRejecting(true);
        const result = await onReject(log.id, teacherNotes.trim());
        setIsRejecting(false);
        if (result.success) {
            showToast("تم رفض السجل", "success");
            onClose();
        } else {
            showToast(result.error || "فشل في رفض السجل", "error");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
        >
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="absolute left-0 top-0 h-full w-full max-w-md bg-surface overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-surface border-b border-border p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-emerald-deep">مراجعة السجل</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-sand transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Student Info */}
                    <Card>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-emerald/10 flex items-center justify-center">
                                    <span className="text-xl font-bold text-emerald">
                                        {log.studentName?.charAt(0) || "ط"}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-emerald-deep">{log.studentName}</p>
                                    <p className="text-sm text-text-muted">
                                        {log.date.toLocaleDateString("ar-SA")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-text-muted">النوع</p>
                                    <p className="font-medium text-emerald-deep">{typeLabel}</p>
                                </div>
                                <div>
                                    <p className="text-text-muted">المقدار</p>
                                    <p className="font-medium text-emerald-deep">{amountText || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Student Notes */}
                    {log.studentNotes && (
                        <Card>
                            <CardContent>
                                <p className="text-sm text-text-muted mb-2">ملاحظات الطالب</p>
                                <p className="text-emerald-deep">{log.studentNotes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Teacher Notes */}
                    <div>
                        <label className="block text-sm font-medium text-emerald-deep mb-2">
                            ملاحظات الشيخ *
                        </label>
                        <textarea
                            value={teacherNotes}
                            onChange={(e) => setTeacherNotes(e.target.value)}
                            placeholder="أضف ملاحظاتك هنا..."
                            rows={4}
                            className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="danger"
                            onClick={handleReject}
                            disabled={isApproving || isRejecting}
                            className="flex-1"
                        >
                            {isRejecting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <X size={18} />
                            )}
                            رفض
                        </Button>
                        <Button
                            variant="gold"
                            onClick={handleApprove}
                            disabled={isApproving || isRejecting}
                            className="flex-1"
                        >
                            {isApproving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Check size={18} />
                            )}
                            اعتماد
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
