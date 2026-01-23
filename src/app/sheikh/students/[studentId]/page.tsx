"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    MessageCircle,
    Plus,
    Calendar,
    BookOpen,
    CheckCircle,
    Clock,
    Trash2,
    Loader2,
    FileText,
    Award,
} from "lucide-react";

import { useStudentDetail, useAssignTask, StudentLog, StudentTask } from "@/lib/hooks/useSheikhStudents";
import { useCreateThread } from "@/lib/hooks/useMessages";
import { useAuth } from "@/lib/auth/hooks";
import { useToast } from "@/components/ui/Toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { staggerContainer, fadeUp, listItem } from "@/lib/motion";

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.studentId as string;
    const { user } = useAuth();
    const { showToast } = useToast();

    const {
        student,
        logs,
        pendingTasks,
        completedTasks,
        isLoading,
        isLoadingMore,
        hasMoreLogs,
        loadMoreLogs,
        error,
    } = useStudentDetail(studentId);

    const { createOrOpenThread, isCreating: isCreatingThread } = useCreateThread();
    const { assignTask, deleteTask, isLoading: isAssigning } = useAssignTask();

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

    // Handle message student
    const handleMessageStudent = async () => {
        if (!studentId) return;
        const result = await createOrOpenThread(studentId);
        if (result.threadId) {
            router.push(`/sheikh/messages/${result.threadId}`);
        } else {
            showToast("فشل في فتح المحادثة", "error");
        }
    };

    // Handle delete task
    const handleDeleteTask = async (taskId: string) => {
        setDeletingTaskId(taskId);
        const result = await deleteTask(taskId);
        setDeletingTaskId(null);
        if (result.success) {
            showToast("تم حذف المهمة", "success");
        } else {
            showToast(result.error || "فشل في حذف المهمة", "error");
        }
    };

    // Handle assign task
    const handleAssignTask = async (data: {
        type: "memorization" | "revision";
        target: { surah?: string; ayahFrom?: number; ayahTo?: number; pages?: number };
        dueDate: string;
        notes?: string;
    }) => {
        if (!student) return;

        const result = await assignTask({
            studentId: student.id,
            circleId: student.circleId,
            ...data,
        });

        if (result.success) {
            showToast("تم إسناد المهمة بنجاح", "success");
            setIsTaskModalOpen(false);
        } else {
            showToast(result.error || "فشل في إسناد المهمة", "error");
        }
    };

    // Calculate stats
    const totalPages = logs
        .filter((l) => l.status === "approved")
        .reduce((sum, l) => sum + (l.amount.pages || 0), 0);

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-32 bg-sand rounded" />
                    <Card><CardContent className="h-32" /></Card>
                    <Card><CardContent className="h-48" /></Card>
                </div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-6">
                <Card>
                    <EmptyState
                        icon={<FileText size={40} />}
                        title="خطأ"
                        description={error || "لم يتم العثور على الطالب"}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            {/* Back Button */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-4">
                <Link
                    href="/sheikh/students"
                    className="inline-flex items-center gap-2 text-text-muted hover:text-emerald transition-colors"
                >
                    <ArrowRight size={18} />
                    العودة للطلاب
                </Link>
            </motion.div>

            {/* Header Profile */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <Card className="mb-6">
                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center overflow-hidden">
                                {student.avatar ? (
                                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-emerald">{student.name.charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-emerald-deep">{student.name}</h1>
                                <p className="text-text-muted">{student.circleName}</p>
                                {student.joinedAt && (
                                    <p className="text-sm text-text-muted">
                                        انضم: {student.joinedAt.toLocaleDateString("ar-SA")}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={handleMessageStudent}
                                isLoading={isCreatingThread}
                            >
                                <MessageCircle size={18} />
                                مراسلة
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Stats */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-4 mb-6"
            >
                <motion.div variants={listItem}>
                    <Card>
                        <CardContent className="text-center py-4">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald/10 flex items-center justify-center">
                                <BookOpen size={24} className="text-emerald" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-deep">{totalPages}</p>
                            <p className="text-sm text-text-muted">صفحة معتمدة</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={listItem}>
                    <Card>
                        <CardContent className="text-center py-4">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gold/10 flex items-center justify-center">
                                <Award size={24} className="text-gold" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-deep">{logs.length}</p>
                            <p className="text-sm text-text-muted">إجمالي السجلات</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Active Tasks */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Clock size={20} className="text-gold" />
                            المهام الحالية ({pendingTasks.length})
                        </CardTitle>
                        <Button variant="gold" size="sm" onClick={() => setIsTaskModalOpen(true)}>
                            <Plus size={16} />
                            إسناد مهمة
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {pendingTasks.length === 0 ? (
                            <div className="text-center py-6 text-text-muted">
                                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                                <p>لم يتم تحديد ورد للحفظ</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onDelete={() => handleDeleteTask(task.id)}
                                        isDeleting={deletingTaskId === task.id}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Progress History */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar size={20} className="text-emerald" />
                            سجل التقدم
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {logs.length === 0 ? (
                            <div className="text-center py-6 text-text-muted">
                                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                <p>لا توجد سجلات بعد</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {logs.map((log) => (
                                        <HistoryItem key={log.id} log={log} />
                                    ))}
                                </div>

                                {hasMoreLogs && (
                                    <div className="mt-4 text-center">
                                        <Button
                                            variant="ghost"
                                            onClick={loadMoreLogs}
                                            isLoading={isLoadingMore}
                                        >
                                            تحميل المزيد
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Task Assign Modal */}
            <TaskAssignModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSubmit={handleAssignTask}
                isLoading={isAssigning}
            />
        </div>
    );
}

// Task Card Component
function TaskCard({
    task,
    onDelete,
    isDeleting,
}: {
    task: StudentTask;
    onDelete: () => void;
    isDeleting: boolean;
}) {
    const typeLabel = task.type === "memorization" ? "حفظ" : "مراجعة";
    const typeColor = task.type === "memorization" ? "bg-emerald/10 text-emerald" : "bg-gold/10 text-gold";

    // Format target
    let targetText = "";
    if (task.target.surah) {
        targetText = `سورة ${task.target.surah}`;
        if (task.target.ayahFrom && task.target.ayahTo) {
            targetText += ` (${task.target.ayahFrom} - ${task.target.ayahTo})`;
        }
    } else if (task.target.pages) {
        targetText = `${task.target.pages} صفحة`;
    }

    return (
        <div className="flex items-center justify-between p-4 bg-sand rounded-xl">
            <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${typeColor}`}>
                    {typeLabel}
                </span>
                <div>
                    <p className="font-medium text-emerald-deep">{targetText}</p>
                    <p className="text-sm text-text-muted flex items-center gap-1">
                        <Calendar size={14} />
                        موعد التسليم: {task.dueDate}
                    </p>
                </div>
            </div>
            <button
                onClick={onDelete}
                disabled={isDeleting}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
        </div>
    );
}

// History Item Component
function HistoryItem({ log }: { log: StudentLog }) {
    const typeLabel = log.type === "memorization" ? "حفظ" : "مراجعة";
    const typeColor = log.type === "memorization" ? "bg-emerald/10 text-emerald" : "bg-gold/10 text-gold";

    const statusConfig: Record<string, { label: string; color: string }> = {
        approved: { label: "معتمد", color: "text-emerald" },
        rejected: { label: "مرفوض", color: "text-red-500" },
        pending_approval: { label: "قيد المراجعة", color: "text-gold" },
    };
    const status = statusConfig[log.status] || { label: log.status, color: "text-text-muted" };

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
        <div className="flex items-start gap-4 p-4 bg-surface border border-border rounded-xl">
            <div className="flex-shrink-0 w-12 text-center">
                <p className="text-lg font-bold text-emerald-deep">
                    {log.date.getDate()}
                </p>
                <p className="text-xs text-text-muted">
                    {log.date.toLocaleDateString("ar-SA", { month: "short" })}
                </p>
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}>
                        {typeLabel}
                    </span>
                    <span className={`text-xs font-medium ${status.color}`}>
                        {status.label}
                    </span>
                </div>
                <p className="font-medium text-emerald-deep">{amountText}</p>
                {log.teacherNotes && (
                    <p className="text-sm text-text-muted mt-1">
                        ملاحظات: {log.teacherNotes}
                    </p>
                )}
            </div>
        </div>
    );
}

// Task Assign Modal
function TaskAssignModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        type: "memorization" | "revision";
        target: { surah?: string; ayahFrom?: number; ayahTo?: number; pages?: number };
        dueDate: string;
        notes?: string;
    }) => Promise<void>;
    isLoading: boolean;
}) {
    const [type, setType] = useState<"memorization" | "revision">("memorization");
    const [inputMode, setInputMode] = useState<"surah" | "pages">("surah");
    const [surah, setSurah] = useState("");
    const [ayahFrom, setAyahFrom] = useState("");
    const [ayahTo, setAyahTo] = useState("");
    const [pages, setPages] = useState("");
    const [dueDate, setDueDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    });
    const [notes, setNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const target: { surah?: string; ayahFrom?: number; ayahTo?: number; pages?: number } = {};

        if (inputMode === "surah") {
            if (!surah.trim()) return;
            target.surah = surah.trim();
            if (ayahFrom) target.ayahFrom = parseInt(ayahFrom);
            if (ayahTo) target.ayahTo = parseInt(ayahTo);
        } else {
            if (!pages) return;
            target.pages = parseInt(pages);
        }

        await onSubmit({ type, target, dueDate, notes: notes.trim() || undefined });

        // Reset form
        setSurah("");
        setAyahFrom("");
        setAyahTo("");
        setPages("");
        setNotes("");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إسناد مهمة جديدة">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                        نوع المهمة
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setType("memorization")}
                            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${type === "memorization"
                                ? "bg-emerald text-white"
                                : "bg-sand text-text hover:bg-emerald/10"
                                }`}
                        >
                            حفظ
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("revision")}
                            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${type === "revision"
                                ? "bg-gold text-white"
                                : "bg-sand text-text hover:bg-gold/10"
                                }`}
                        >
                            مراجعة
                        </button>
                    </div>
                </div>

                {/* Input Mode Toggle */}
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                        تحديد المقدار
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setInputMode("surah")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${inputMode === "surah"
                                ? "bg-emerald/10 text-emerald border border-emerald"
                                : "bg-sand text-text-muted"
                                }`}
                        >
                            بالسورة والآيات
                        </button>
                        <button
                            type="button"
                            onClick={() => setInputMode("pages")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${inputMode === "pages"
                                ? "bg-emerald/10 text-emerald border border-emerald"
                                : "bg-sand text-text-muted"
                                }`}
                        >
                            بالصفحات
                        </button>
                    </div>
                </div>

                {/* Target Inputs */}
                {inputMode === "surah" ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-emerald-deep mb-2">
                                اسم السورة *
                            </label>
                            <input
                                type="text"
                                value={surah}
                                onChange={(e) => setSurah(e.target.value)}
                                placeholder="مثال: البقرة"
                                className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-emerald-deep mb-2">
                                    من آية
                                </label>
                                <input
                                    type="number"
                                    value={ayahFrom}
                                    onChange={(e) => setAyahFrom(e.target.value)}
                                    placeholder="1"
                                    min="1"
                                    className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-emerald-deep mb-2">
                                    إلى آية
                                </label>
                                <input
                                    type="number"
                                    value={ayahTo}
                                    onChange={(e) => setAyahTo(e.target.value)}
                                    placeholder="10"
                                    min="1"
                                    className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-emerald-deep mb-2">
                            عدد الصفحات *
                        </label>
                        <input
                            type="number"
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                            placeholder="مثال: 2"
                            min="1"
                            className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50"
                            required
                        />
                    </div>
                )}

                {/* Due Date */}
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                        موعد التسليم
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                        ملاحظات (اختياري)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="تعليمات إضافية للطالب..."
                        rows={2}
                        className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                        إلغاء
                    </Button>
                    <Button type="submit" variant="gold" isLoading={isLoading} className="flex-1">
                        إسناد المهمة
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
