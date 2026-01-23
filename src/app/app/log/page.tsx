"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Download,
    BookOpen,
    RotateCcw,
    Users,
} from "lucide-react";

import { useMembership } from "@/lib/hooks/useMembership";
import { useLogsWithFilters, Log } from "@/lib/hooks/useLogs";
import { exportLogsToCSV } from "@/lib/utils/exportCsv";
import { useToast } from "@/components/ui/Toast";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Skeleton";

import { FiltersPanel } from "@/components/log/FiltersPanel";
import { LogsTable } from "@/components/log/LogsTable";
import { LogDetailsDrawer } from "@/components/log/LogDetailsDrawer";

import { pageTransition, fadeUp } from "@/lib/motion";

// Helper to format date (handles string, Date, or Timestamp)
function formatLogDate(date: unknown): string {
    if (!date) return "غير محدد";
    if (typeof date === "string") return date;
    if (date instanceof Date) return date.toLocaleDateString("ar-SA");
    // Handle Firestore Timestamp
    if (typeof date === "object" && "toDate" in date && typeof (date as any).toDate === "function") {
        return (date as any).toDate().toLocaleDateString("ar-SA");
    }
    return "غير محدد";
}

export default function LogPage() {
    const { activeCircle, hasApprovedMembership, isLoading: membershipLoading } = useMembership();
    const {
        logs,
        isLoading,
        isLoadingMore,
        hasMore,
        filters,
        updateFilters,
        clearFilters,
        addLog,
        updateStudentNotes,
        loadMore,
    } = useLogsWithFilters(activeCircle?.id || null);
    const { showToast } = useToast();

    const [showAddLogModal, setShowAddLogModal] = useState(false);
    const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const [editingLog, setEditingLog] = useState<Log | null>(null);
    const [showEditNotesModal, setShowEditNotesModal] = useState(false);

    const handleViewDetails = (log: Log) => {
        setSelectedLog(log);
        setShowDetailsDrawer(true);
    };

    const handleEditNotes = (log: Log) => {
        setEditingLog(log);
        setShowEditNotesModal(true);
    };

    const handleExportCSV = () => {
        if (logs.length === 0) {
            showToast("لا توجد سجلات للتصدير", "error");
            return;
        }
        exportLogsToCSV(logs);
        showToast("تم تصدير السجلات بنجاح", "success");
    };

    const handleUpdateNotes = async (logId: string, notes: string) => {
        const result = await updateStudentNotes(logId, notes);
        if (result.success) {
            showToast("تم تحديث الملاحظات", "success");
        }
        return result;
    };

    // Loading state
    if (membershipLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-emerald-deep">سجلي</h1>
                    <p className="text-sm text-text-muted">سجل الحفظ والمراجعة الخاص بك</p>
                </div>
                <div className="space-y-4">
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        );
    }

    // No approved circle state
    if (!hasApprovedMembership) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-emerald-deep">سجلي</h1>
                </div>
                <motion.div variants={fadeUp} initial="hidden" animate="visible">
                    <Card className="text-center py-12">
                        <EmptyState
                            icon={<Users size={40} />}
                            title="لا توجد حلقة نشطة"
                            description="يجب الانضمام إلى حلقة أولاً لعرض سجلاتك"
                            action={{
                                label: "العودة للوحة التحكم",
                                onClick: () => (window.location.href = "/app/dashboard"),
                            }}
                        />
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-emerald-deep">سجلي</h1>
                    <p className="text-sm text-text-muted">سجل الحفظ والمراجعة الخاص بك</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={handleExportCSV}>
                        <Download size={16} />
                        تصدير CSV
                    </Button>
                    <Button variant="gold" onClick={() => setShowAddLogModal(true)}>
                        <Plus size={18} />
                        إضافة سجل
                    </Button>
                </div>
            </div>

            <motion.div
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Filters */}
                <FiltersPanel
                    filters={filters}
                    onFiltersChange={updateFilters}
                    onClearFilters={clearFilters}
                />

                {/* Table */}
                <LogsTable
                    logs={logs}
                    isLoading={isLoading}
                    isLoadingMore={isLoadingMore}
                    hasMore={hasMore}
                    onLoadMore={loadMore}
                    onViewDetails={handleViewDetails}
                    onEditNotes={handleEditNotes}
                    onAddLog={() => setShowAddLogModal(true)}
                />
            </motion.div>

            {/* Add Log Modal */}
            <AddLogModal
                isOpen={showAddLogModal}
                onClose={() => setShowAddLogModal(false)}
                onSuccess={() => {
                    setShowAddLogModal(false);
                    showToast("تم إضافة السجل بنجاح", "success");
                }}
                addLog={addLog}
            />

            {/* Details Drawer */}
            <LogDetailsDrawer
                log={selectedLog}
                isOpen={showDetailsDrawer}
                onClose={() => setShowDetailsDrawer(false)}
                onUpdateNotes={handleUpdateNotes}
            />

            {/* Edit Notes Modal */}
            <EditNotesModal
                log={editingLog}
                isOpen={showEditNotesModal}
                onClose={() => setShowEditNotesModal(false)}
                onUpdateNotes={handleUpdateNotes}
                onSuccess={() => {
                    setShowEditNotesModal(false);
                    showToast("تم تحديث الملاحظات", "success");
                }}
            />
        </div>
    );
}

// Add Log Modal Component
function AddLogModal({
    isOpen,
    onClose,
    onSuccess,
    addLog,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    addLog: (data: any) => Promise<{ success: boolean; error?: string }>;
}) {
    const [logType, setLogType] = useState<"memorization" | "revision">("memorization");
    const [pages, setPages] = useState("");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const pagesNum = parseInt(pages);
        if (!pagesNum || pagesNum < 1) {
            setError("الرجاء إدخال عدد صفحات صحيح");
            return;
        }
        setIsLoading(true);
        setError(null);
        const result = await addLog({
            type: logType,
            amount: { pages: pagesNum },
            studentNotes: notes || undefined,
        });
        setIsLoading(false);
        if (result.success) {
            setPages("");
            setNotes("");
            setLogType("memorization");
            onSuccess();
        } else {
            setError(result.error || "حدث خطأ");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إضافة سجل جديد" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">نوع الإنجاز</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setLogType("memorization")}
                            className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${logType === "memorization"
                                ? "border-gold bg-gold/10 text-gold"
                                : "border-border text-text-muted hover:border-gold/50"
                                }`}
                        >
                            <BookOpen size={18} />
                            حفظ
                        </button>
                        <button
                            type="button"
                            onClick={() => setLogType("revision")}
                            className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${logType === "revision"
                                ? "border-emerald bg-emerald/10 text-emerald"
                                : "border-border text-text-muted hover:border-emerald/50"
                                }`}
                        >
                            <RotateCcw size={18} />
                            مراجعة
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">عدد الصفحات</label>
                    <input
                        type="number"
                        value={pages}
                        onChange={(e) => setPages(e.target.value)}
                        placeholder="0"
                        min="1"
                        className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text text-center text-2xl focus:outline-none focus:ring-2 focus:ring-gold/50"
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">ملاحظات (اختياري)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="أضف ملاحظات..."
                        rows={2}
                        className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text resize-none focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" variant="gold" className="w-full" isLoading={isLoading}>
                    إضافة السجل
                </Button>
            </form>
        </Modal>
    );
}

// Edit Notes Modal
function EditNotesModal({
    log,
    isOpen,
    onClose,
    onUpdateNotes,
    onSuccess,
}: {
    log: Log | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateNotes: (logId: string, notes: string) => Promise<{ success: boolean; error?: string }>;
    onSuccess: () => void;
}) {
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync notes when log changes (moved to useEffect to prevent infinite loop)
    useEffect(() => {
        setNotes(log?.studentNotes || "");
    }, [log]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!log) return;
        setIsLoading(true);
        setError(null);
        const result = await onUpdateNotes(log.id, notes);
        setIsLoading(false);
        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || "حدث خطأ");
        }
    };

    if (!log) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="تعديل الملاحظات" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-sand rounded-xl">
                    <p className="text-sm text-text-muted mb-1">السجل:</p>
                    <p className="font-medium text-emerald-deep">
                        {log.type === "memorization" ? "حفظ" : "مراجعة"} - {log.amount.pages} صفحة - {formatLogDate(log.date)}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">ملاحظاتك</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="أضف ملاحظات..."
                        rows={4}
                        className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text resize-none focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                    <p className="text-xs text-text-muted mt-2">
                        ملاحظة: لا يمكنك تعديل التاريخ أو النوع أو المقدار بعد الإرسال
                    </p>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex gap-2">
                    <Button type="submit" variant="gold" className="flex-1" isLoading={isLoading}>
                        حفظ التعديلات
                    </Button>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        إلغاء
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
