"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Check,
    Clock,
    X,
    AlertCircle,
    FileText,
    Loader2,
    TrendingUp,
    HourglassIcon,
    XCircle,
} from "lucide-react";
import {
    useAttendance,
    AttendanceRecord,
    AttendanceStats,
    Excuse,
    formatDateKey,
    getLastNDays,
} from "@/lib/hooks/useAttendance";
import ExcuseModal from "./ExcuseModal";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface AttendanceHistoryProps {
    circleId: string;
}

const STATUS_CONFIG = {
    present: { label: "حاضر", icon: Check, color: "bg-emerald", textColor: "text-emerald" },
    late: { label: "متأخر", icon: Clock, color: "bg-gold", textColor: "text-gold" },
    absent: { label: "غائب", icon: X, color: "bg-red-500", textColor: "text-red-500" },
    excused: { label: "بعذر", icon: AlertCircle, color: "bg-purple-500", textColor: "text-purple-500" },
};

const EXCUSE_STATUS_BADGE = {
    pending: { label: "جاري المراجعة", color: "bg-amber-100 text-amber-700 border-amber-200", icon: HourglassIcon },
    rejected: { label: "العذر مرفوض", color: "bg-red-100 text-red-600 border-red-200", icon: XCircle },
    approved: { label: "العذر مقبول", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Check },
};

export default function AttendanceHistory({ circleId }: AttendanceHistoryProps) {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [excuses, setExcuses] = useState<Excuse[]>([]);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const { isLoading, error, fetchMyAttendance, fetchMyExcuses, calculateStats } = useAttendance(circleId);

    const loadAttendance = useCallback(async () => {
        const [attendanceData, excuseData] = await Promise.all([
            fetchMyAttendance(7),
            fetchMyExcuses(),
        ]);
        setRecords(attendanceData);
        setExcuses(excuseData);
        setStats(calculateStats(attendanceData));
    }, [fetchMyAttendance, fetchMyExcuses, calculateStats]);

    useEffect(() => {
        loadAttendance();
    }, [loadAttendance]);

    // Get excuse for a specific date
    const getExcuseForDate = (dateKey: string): Excuse | undefined => {
        return excuses.find((e) => e.date === dateKey);
    };

    const openExcuseModal = (date?: string) => {
        setSelectedDate(date || formatDateKey(new Date()));
        setIsExcuseModalOpen(true);
    };

    const handleExcuseSuccess = () => {
        setIsExcuseModalOpen(false);
        loadAttendance(); // Refresh data
    };

    // Format date for display (Arabic)
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

    // Get attendance for last 7 days (including days without records)
    const last7Days = getLastNDays(7);
    const attendanceByDate = new Map(records.map((r) => [r.date, r]));

    return (
        <div className="space-y-6">
            {/* Stats Card */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-gradient-to-br from-emerald to-emerald-deep text-white"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold">نسبة الحضور</h3>
                            <p className="text-white/70 text-sm">آخر {stats.totalDays} أيام</p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <TrendingUp size={28} />
                        </div>
                    </div>

                    {/* Percentage Display */}
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-5xl font-bold">{stats.attendanceRate}</span>
                        <span className="text-2xl text-white/70 mb-1">%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.attendanceRate}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gold rounded-full"
                        />
                    </div>

                    {/* Stats Breakdown */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white/10 rounded-lg p-2">
                            <div className="text-lg font-bold">{stats.present}</div>
                            <div className="text-xs text-white/70">حاضر</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2">
                            <div className="text-lg font-bold">{stats.late}</div>
                            <div className="text-xs text-white/70">متأخر</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2">
                            <div className="text-lg font-bold">{stats.absent}</div>
                            <div className="text-xs text-white/70">غائب</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2">
                            <div className="text-lg font-bold">{stats.excused}</div>
                            <div className="text-xs text-white/70">بعذر</div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Submit Excuse Button */}
            <button
                onClick={() => openExcuseModal()}
                className="w-full btn-secondary flex items-center justify-center gap-2"
            >
                <FileText size={20} />
                <span>تقديم عذر</span>
            </button>

            {/* Attendance History List */}
            <div>
                <h3 className="text-lg font-bold text-emerald-deep mb-4">
                    سجل آخر 7 أيام
                </h3>

                {isLoading ? (
                    <div className="card flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-emerald animate-spin" />
                        <span className="mr-3 text-text-muted">جاري التحميل...</span>
                    </div>
                ) : (

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3"
                    >
                        {last7Days.map((dateKey) => {
                            const record = attendanceByDate.get(dateKey);
                            const status = record?.status || null;
                            const config = status ? STATUS_CONFIG[status] : null;
                            const excuse = getExcuseForDate(dateKey);
                            const excuseConfig = excuse && excuse.status !== "approved"
                                ? EXCUSE_STATUS_BADGE[excuse.status]
                                : null;

                            return (
                                <motion.div
                                    key={dateKey}
                                    variants={fadeUp}
                                    className="card"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-sand rounded-lg flex items-center justify-center">
                                                <Calendar size={20} className="text-emerald" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-emerald-deep">
                                                    {formatDisplayDate(dateKey)}
                                                </div>
                                                <div className="text-xs text-text-muted">
                                                    {dateKey}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap justify-end">
                                            {/* Attendance Status Badge */}
                                            {config ? (
                                                <div
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color} text-white text-sm`}
                                                >
                                                    <config.icon size={14} />
                                                    <span>{config.label}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand text-text-muted text-sm">
                                                    <span>لم يُسجل</span>
                                                </div>
                                            )}

                                            {/* Excuse Status Badge (for pending/rejected) */}
                                            {excuseConfig && (
                                                <div
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${excuseConfig.color}`}
                                                >
                                                    <excuseConfig.icon size={12} />
                                                    <span>{excuseConfig.label}</span>
                                                </div>
                                            )}

                                            {/* Show excuse button for absent days without pending excuse */}
                                            {status === "absent" && !excuse && (
                                                <button
                                                    onClick={() => openExcuseModal(dateKey)}
                                                    className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors"
                                                    title="تقديم عذر"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="card bg-red-50 border-red-200 text-red-600">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Excuse Modal */}
            <ExcuseModal
                isOpen={isExcuseModalOpen}
                onClose={() => setIsExcuseModalOpen(false)}
                onSuccess={handleExcuseSuccess}
                circleId={circleId}
                initialDate={selectedDate || undefined}
            />
        </div>
    );
}
