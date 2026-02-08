"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Check,
    X,
    Clock,
    AlertCircle,
    FileText,
    Loader2,
    ArrowRight,
    CheckCircle2,
    XCircle,
    HourglassIcon,
    User,
    MessageSquare,
} from "lucide-react";
import Link from "next/link";

import { useMembership } from "@/lib/hooks/useMembership";
import {
    useAttendance,
    AttendanceRecord,
    Excuse,
    formatDateKey,
    getLastNDays,
} from "@/lib/hooks/useAttendance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { fadeUp, staggerContainer, listItem } from "@/lib/motion";

// Status badge configurations - matches top stats cards colors
const STATUS_CONFIG = {
    present: {
        label: "حاضر",
        icon: CheckCircle2,
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-700",
    },
    late: {
        label: "متأخر",
        icon: Clock,
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
    },
    absent: {
        label: "غائب",
        icon: XCircle,
        bgColor: "bg-rose-100",
        textColor: "text-rose-700",
    },
    excused: {
        label: "بعذر",
        icon: AlertCircle,
        bgColor: "bg-violet-100",
        textColor: "text-violet-700",
    },
};

const EXCUSE_STATUS_CONFIG = {
    pending: {
        label: "⏳ جاري مراجعة العذر",
        icon: HourglassIcon,
        bgColor: "bg-amber-50",
        textColor: "text-amber-600",
    },
    approved: {
        label: "✅ تم قبول العذر",
        icon: CheckCircle2,
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-600",
    },
    rejected: {
        label: "❌ رُفض العذر",
        icon: XCircle,
        bgColor: "bg-red-50",
        textColor: "text-red-600",
    },
};

// Helper function to check if status is "absent" (handles all variations)
const isAbsent = (status: string | null | undefined): boolean => {
    if (!status) return false;
    const s = status.toString().trim().toLowerCase();
    return s === 'absent' || s === 'ghayeb' || s === 'غائب';
};

// Helper function to check if status is "excused" (handles all variations)
const isExcused = (status: string | null | undefined): boolean => {
    if (!status) return false;
    const s = status.toString().trim().toLowerCase();
    return s === 'excused' || s === 'بعذر' || s === 'mobarrar';
};

// Normalize status to lowercase key for STATUS_CONFIG lookup
const normalizeStatus = (status: string | null | undefined): keyof typeof STATUS_CONFIG | null => {
    if (!status) return null;
    const s = status.toString().trim().toLowerCase();

    if (s === 'present' || s === 'حاضر') return 'present';
    if (s === 'absent' || s === 'غائب' || s === 'ghayeb') return 'absent';
    if (s === 'late' || s === 'متأخر') return 'late';
    if (s === 'excused' || s === 'بعذر') return 'excused';

    return null;
};

interface AttendanceWithExcuse extends AttendanceRecord {
    excuse?: Excuse;
}

export default function StudentAttendancePage() {
    const { activeCircle, isLoading: membershipLoading, hasApprovedMembership } = useMembership();
    const [records, setRecords] = useState<AttendanceWithExcuse[]>([]);
    const [excuses, setExcuses] = useState<Excuse[]>([]);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, excused: 0 });

    // Modal state
    const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [excuseReason, setExcuseReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        isLoading: attendanceLoading,
        error,
        fetchMyAttendance,
        fetchMyExcuses,
        submitExcuse,
    } = useAttendance(activeCircle?.id || undefined);
    const { showToast } = useToast();

    const isLoading = membershipLoading || attendanceLoading;

    // Load attendance and excuses
    const loadData = useCallback(async () => {
        if (!activeCircle?.id) return;

        const [attendanceData, excuseData] = await Promise.all([
            fetchMyAttendance(30), // Last 30 days
            fetchMyExcuses(),
        ]);

        // DEBUG: Log fetched data
        console.log("📊 [Attendance Page] Fetched attendance:", attendanceData);
        console.log("📊 [Attendance Page] Fetched excuses:", excuseData);
        console.log("📊 [Attendance Page] Attendance statuses:", attendanceData.map(r => ({ date: r.date, status: r.status })));

        setExcuses(excuseData);

        // Merge excuses with attendance records
        const excuseByDate = new Map(excuseData.map((e) => [e.date, e]));
        const mergedRecords = attendanceData.map((record) => ({
            ...record,
            excuse: excuseByDate.get(record.date),
        }));

        console.log("📊 [Attendance Page] Merged records:", mergedRecords);

        setRecords(mergedRecords);

        // Calculate stats
        const newStats = { present: 0, absent: 0, late: 0, excused: 0 };
        attendanceData.forEach((r) => {
            const normalized = normalizeStatus(r.status);
            if (normalized === "present") newStats.present++;
            else if (normalized === "absent") newStats.absent++;
            else if (normalized === "late") newStats.late++;
            else if (normalized === "excused") newStats.excused++;
        });
        console.log("📊 [Attendance Page] Stats:", newStats);
        setStats(newStats);
    }, [activeCircle?.id, fetchMyAttendance, fetchMyExcuses]);

    useEffect(() => {
        if (activeCircle?.id) {
            loadData();
        }
    }, [activeCircle?.id, loadData]);

    // Open excuse modal
    const openExcuseModal = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setExcuseReason("");
        setIsExcuseModalOpen(true);
    };

    // Submit excuse
    const handleSubmitExcuse = async () => {
        if (!selectedRecord || !excuseReason.trim()) {
            showToast("الرجاء كتابة سبب العذر", "error");
            return;
        }

        setIsSubmitting(true);
        const success = await submitExcuse(selectedRecord.date, excuseReason.trim());
        setIsSubmitting(false);

        if (success) {
            showToast("تم تقديم العذر بنجاح", "success");
            setIsExcuseModalOpen(false);
            setExcuseReason("");
            loadData(); // Refresh data
        } else {
            showToast("فشل في تقديم العذر", "error");
        }
    };

    // Get excuse for a specific date
    const getExcuseForDate = (dateKey: string): Excuse | undefined => {
        return excuses.find((e) => e.date === dateKey);
    };

    // Format date for display
    const formatDisplayDate = (dateKey: string) => {
        const date = new Date(dateKey + "T00:00:00");
        const today = formatDateKey(new Date());
        const yesterday = formatDateKey(new Date(Date.now() - 86400000));

        if (dateKey === today) return "اليوم";
        if (dateKey === yesterday) return "أمس";

        return date.toLocaleDateString("ar-SA", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    // Build full data including days without records
    const last30Days = getLastNDays(30);
    const recordsByDate = new Map(records.map((r) => [r.date, r]));

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6"
            >
                <Link
                    href="/student"
                    className="p-2 hover:bg-sand rounded-lg transition-colors"
                >
                    <ArrowRight size={20} className="text-emerald-deep" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-emerald-deep flex items-center gap-2">
                        <Calendar size={28} className="text-gold" />
                        سجل الحضور والغياب
                    </h1>
                    <p className="text-sm text-text-muted">
                        متابعة حضورك وتقديم الأعذار
                    </p>
                </div>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                    <CardSkeleton />
                </div>
            )}

            {/* No Membership */}
            {!isLoading && !hasApprovedMembership && (
                <motion.div variants={fadeUp} initial="hidden" animate="visible">
                    <Card className="text-center py-12">
                        <EmptyState
                            icon={<Calendar size={40} className="text-emerald" />}
                            title="لا يوجد حلقة مُسجلة"
                            description="يجب أن تكون عضواً في حلقة لعرض سجل الحضور"
                            action={{
                                label: "العودة للرئيسية",
                                onClick: () => (window.location.href = "/student"),
                            }}
                        />
                    </Card>
                </motion.div>
            )}

            {/* Main Content */}
            {!isLoading && hasApprovedMembership && activeCircle && (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Summary Cards - Exact Reference Design */}
                    <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Present Card */}
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-emerald-900 rounded-full flex items-center justify-center">
                                <Check size={24} strokeWidth={3} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.present}</span>
                            <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">حاضر</span>
                        </div>

                        {/* Late Card */}
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                                <Clock size={24} strokeWidth={3} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.late}</span>
                            <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">متأخر</span>
                        </div>

                        {/* Absent Card */}
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center">
                                <X size={24} strokeWidth={3} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.absent}</span>
                            <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">غائب</span>
                        </div>

                        {/* Excused Card */}
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center">
                                <AlertCircle size={24} strokeWidth={3} className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.excused}</span>
                            <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">بعذر</span>
                        </div>
                    </motion.div>

                    {/* Attendance Table */}
                    <motion.div variants={fadeUp}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText size={20} className="text-gold" />
                                    سجل آخر 30 يوم
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Table Header */}
                                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-sand/50 border-b border-border text-sm font-medium text-emerald-deep">
                                    <div className="col-span-3">التاريخ</div>
                                    <div className="col-span-2">الحالة</div>
                                    <div className="col-span-3">المعلم</div>
                                    <div className="col-span-4">ملاحظات / الإجراء</div>
                                </div>

                                {/* Table Body */}
                                <div className="divide-y divide-border">
                                    {last30Days.map((dateKey) => {
                                        const record = recordsByDate.get(dateKey);
                                        const rawStatus = record?.status || null;
                                        const normalizedStatus = normalizeStatus(rawStatus);
                                        const statusConfig = normalizedStatus ? STATUS_CONFIG[normalizedStatus] : null;
                                        const excuse = getExcuseForDate(dateKey);

                                        // Determine what to show in the action column
                                        const renderActionColumn = () => {
                                            // If already excused, don't show anything
                                            if (isExcused(rawStatus)) {
                                                return (
                                                    <span className="text-sm text-yellow-600">
                                                        غياب مبرر
                                                    </span>
                                                );
                                            }

                                            // If excuse exists, show its status
                                            if (excuse) {
                                                const excuseConfig = EXCUSE_STATUS_CONFIG[excuse.status];
                                                return (
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${excuseConfig.bgColor} ${excuseConfig.textColor}`}>
                                                        <excuseConfig.icon size={14} />
                                                        {excuseConfig.label}
                                                    </div>
                                                );
                                            }

                                            // If absent and no excuse, show submit button
                                            if (isAbsent(rawStatus)) {
                                                return (
                                                    <Button
                                                        variant="gold"
                                                        size="sm"
                                                        onClick={() => record && openExcuseModal(record)}
                                                        className="text-xs"
                                                    >
                                                        <FileText size={14} />
                                                        تقديم عذر
                                                    </Button>
                                                );
                                            }

                                            // For present/late or no record
                                            return (
                                                <span className="text-sm text-text-muted">—</span>
                                            );
                                        };

                                        return (
                                            <motion.div
                                                key={dateKey}
                                                variants={listItem}
                                                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 hover:bg-sand/30 transition-colors"
                                            >
                                                {/* Date */}
                                                <div className="col-span-1 md:col-span-3 flex items-center gap-2">
                                                    <Calendar size={16} className="text-emerald hidden md:block" />
                                                    <div>
                                                        <div className="font-medium text-emerald-deep">
                                                            {formatDisplayDate(dateKey)}
                                                        </div>
                                                        <div className="text-xs text-text-muted" dir="ltr">
                                                            {dateKey}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className="col-span-1 md:col-span-2 flex items-center">
                                                    {statusConfig ? (
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                                            <statusConfig.icon className="w-3.5 h-3.5" />
                                                            {statusConfig.label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                                            لم يُسجل
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Teacher (placeholder) */}
                                                <div className="col-span-1 md:col-span-3 flex items-center gap-2 text-sm text-text-muted">
                                                    <User size={14} className="hidden md:block" />
                                                    <span>{activeCircle.name}</span>
                                                </div>

                                                {/* Action/Notes */}
                                                <div className="col-span-1 md:col-span-4 flex items-center">
                                                    {renderActionColumn()}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Empty state */}
                                {records.length === 0 && !isLoading && (
                                    <div className="p-8">
                                        <EmptyState
                                            icon={<Calendar size={40} className="text-emerald" />}
                                            title="لا يوجد سجل حضور"
                                            description="لم يتم تسجيل أي حضور بعد"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}

            {/* Error Display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2"
                >
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </motion.div>
            )}

            {/* Excuse Submit Modal */}
            <Modal
                isOpen={isExcuseModalOpen}
                onClose={() => setIsExcuseModalOpen(false)}
                title="تقديم عذر غياب"
                size="md"
            >
                <div className="space-y-4">
                    {/* Date Display */}
                    {selectedRecord && (
                        <div className="bg-sand/50 rounded-xl p-4 border border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <Calendar size={20} className="text-red-500" />
                                </div>
                                <div>
                                    <div className="font-medium text-emerald-deep">
                                        تاريخ الغياب
                                    </div>
                                    <div className="text-sm text-text-muted">
                                        {formatDisplayDate(selectedRecord.date)} ({selectedRecord.date})
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reason Textarea */}
                    <div>
                        <label className="block text-sm font-medium text-emerald-deep mb-2">
                            سبب الغياب <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={excuseReason}
                            onChange={(e) => setExcuseReason(e.target.value)}
                            placeholder="اكتب سبب غيابك هنا..."
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-emerald-deep placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald"
                        />
                        <div className="text-xs text-text-muted text-left mt-1">
                            {excuseReason.length}/500
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-start gap-2">
                        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                        <span>
                            سيتم إرسال العذر للشيخ للمراجعة. في حال القبول سيتم تحديث حالة الحضور تلقائياً.
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setIsExcuseModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="gold"
                            className="flex-1"
                            onClick={handleSubmitExcuse}
                            disabled={isSubmitting || !excuseReason.trim()}
                            isLoading={isSubmitting}
                        >
                            <FileText size={16} />
                            تقديم العذر
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
