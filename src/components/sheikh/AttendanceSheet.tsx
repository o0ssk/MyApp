"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ChevronLeft,
    Check,
    Clock,
    X,
    AlertCircle,
    Save,
    Loader2,
    UserCheck,
    AlertTriangle,
    Users,
} from "lucide-react";
import {
    useAttendance,
    AttendanceStatus,
    formatDateKey,
    Excuse,
} from "@/lib/hooks/useAttendance";
import { useSheikhStudents, Student } from "@/lib/hooks/useSheikhStudents";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface AttendanceSheetProps {
    circleId: string;
    onSaveSuccess?: () => void;
    selectedDate?: Date;              // جديد: يأتي من الأب
    onDateChange?: (date: Date) => void; // جديد: لتغيير تاريخ الأب
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: React.ElementType; color: string }[] = [
    { value: "present", label: "حاضر", icon: Check, color: "bg-emerald text-white" },
    { value: "late", label: "متأخر", icon: Clock, color: "bg-gold text-white" },
    { value: "absent", label: "غائب", icon: X, color: "bg-red-500 text-white" },
    { value: "excused", label: "بعذر", icon: AlertCircle, color: "bg-purple-500 text-white" },
];

export default function AttendanceSheet({ circleId, onSaveSuccess, selectedDate: externalDate, onDateChange }: AttendanceSheetProps) {
    const [internalDate, setInternalDate] = useState<Date>(new Date());

    // التاريخ الفعلي هو الذي يأتي من الخارج، أو الداخلي كاحتياط
    const currentDate = externalDate || internalDate;

    // دالة لتغيير التاريخ
    const handleDateChange = (newDate: Date) => {
        if (onDateChange) {
            onDateChange(newDate); // أخبر الصفحة الرئيسية
        } else {
            setInternalDate(newDate); // غيّر الداخلي فقط (احتياط)
        }
    };

    const [attendance, setAttendance] = useState<Map<string, AttendanceStatus>>(new Map());
    const [pendingExcuses, setPendingExcuses] = useState<Map<string, Excuse>>(new Map());
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // ✅ Use the useSheikhStudents hook to fetch students for THIS circle
    const { students: rawStudents, isLoading: studentsLoading, error: studentsError } = useSheikhStudents(circleId);

    // Transform students to the format we need (id, name, avatar)
    const students = useMemo(() => {
        return rawStudents.map((s: Student) => ({
            id: s.odeiUserId, // This is the actual user ID
            name: s.odei,      // This is the student's name
            avatar: s.avatar,
        }));
    }, [rawStudents]);

    const {
        isLoading: attendanceLoading,
        error: attendanceError,
        fetchDailyAttendance,
        saveAttendance,
        checkPendingExcuse,
    } = useAttendance(circleId);

    const dateKey = formatDateKey(currentDate);

    // Fetch attendance for the selected date
    const loadAttendance = useCallback(async () => {
        if (students.length === 0) return;

        const records = await fetchDailyAttendance(dateKey);
        const statusMap = new Map<string, AttendanceStatus>();

        records.forEach((record, studentId) => {
            statusMap.set(studentId, record.status);
        });

        // Set default status for students without records
        students.forEach((student) => {
            if (!statusMap.has(student.id)) {
                statusMap.set(student.id, "absent"); // Default to absent
            }
        });

        setAttendance(statusMap);
        setHasChanges(false);
    }, [dateKey, students, fetchDailyAttendance]);

    // Load pending excuses for each student
    const loadPendingExcuses = useCallback(async () => {
        if (students.length === 0) return;

        const excuseMap = new Map<string, Excuse>();
        for (const student of students) {
            const excuse = await checkPendingExcuse(student.id, dateKey);
            if (excuse) {
                excuseMap.set(student.id, excuse);
            }
        }
        setPendingExcuses(excuseMap);
    }, [students, dateKey, checkPendingExcuse]);

    // Load data when students or date changes
    useEffect(() => {
        if (students.length > 0) {
            loadAttendance();
            loadPendingExcuses();
        }
    }, [students.length, dateKey, loadAttendance, loadPendingExcuses]);

    // Navigate to previous/next day
    const goToPreviousDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        handleDateChange(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        // Don't allow future dates
        if (newDate <= new Date()) {
            handleDateChange(newDate);
        }
    };

    // Update student status
    const updateStatus = (studentId: string, status: AttendanceStatus) => {
        setAttendance((prev) => {
            const newMap = new Map(prev);
            newMap.set(studentId, status);
            return newMap;
        });
        setHasChanges(true);
        setSaveMessage(null);
    };

    // Save all changes
    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        const records = Array.from(attendance.entries()).map(([studentId, status]) => ({
            studentId,
            status,
        }));

        const success = await saveAttendance(dateKey, records);

        if (success) {
            setHasChanges(false);
            setSaveMessage({ type: "success", text: "تم حفظ الحضور بنجاح" });
            onSaveSuccess?.();
        } else {
            setSaveMessage({ type: "error", text: "فشل في حفظ الحضور" });
        }

        setIsSaving(false);
    };

    // Format date for display
    const formatDisplayDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        return date.toLocaleDateString("ar-SA", options);
    };

    const isToday = formatDateKey(new Date()) === dateKey;
    const isLoading = studentsLoading || attendanceLoading;
    const error = studentsError || attendanceError;

    // ✅ Handle loading state
    if (studentsLoading) {
        return (
            <div className="card flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald animate-spin" />
                <span className="mr-3 text-text-muted">جاري تحميل قائمة الطلاب...</span>
            </div>
        );
    }

    // ✅ Handle empty students case
    if (students.length === 0) {
        return (
            <div className="text-center p-8 border-2 border-dashed border-border rounded-xl bg-surface">
                <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-lg font-medium text-emerald-deep mb-2">
                    لم يتم العثور على طلاب في هذه الحلقة
                </p>
                <p className="text-sm text-gold">
                    تأكد من أن الطلاب قد انضموا باستخدام كود الحلقة وتمت الموافقة عليهم.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Date Navigation Header */}
            <div className="card">
                <div className="flex items-center justify-between">
                    <button
                        onClick={goToNextDay}
                        disabled={isToday}
                        className={`p-3 rounded-xl transition-colors ${isToday
                            ? "text-text-muted/30 cursor-not-allowed"
                            : "text-emerald hover:bg-emerald/10"
                            }`}
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="text-center">
                        <h2 className="text-xl font-bold text-emerald-deep">
                            {formatDisplayDate(currentDate)}
                        </h2>
                        {isToday && (
                            <span className="text-sm text-gold">اليوم</span>
                        )}
                    </div>

                    <button
                        onClick={goToPreviousDay}
                        className="p-3 rounded-xl text-emerald hover:bg-emerald/10 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-3">
                {STATUS_OPTIONS.map((option) => {
                    const count = Array.from(attendance.values()).filter(
                        (s) => s === option.value
                    ).length;
                    return (
                        <div key={option.value} className="card text-center p-4">
                            <div className={`w-10 h-10 mx-auto rounded-full ${option.color} flex items-center justify-center mb-2`}>
                                <option.icon size={20} />
                            </div>
                            <div className="text-2xl font-bold text-emerald-deep">{count}</div>
                            <div className="text-xs text-text-muted">{option.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Student Count */}
            <div className="flex items-center gap-2 text-text-muted text-sm">
                <UserCheck size={16} />
                <span>إجمالي الطلاب: {students.length}</span>
            </div>

            {/* Students List */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3"
            >
                {students.map((student) => {
                    const currentStatus = attendance.get(student.id) || "absent";
                    const hasPendingExcuse = pendingExcuses.has(student.id);

                    return (
                        <motion.div
                            key={student.id}
                            variants={fadeUp}
                            className="card"
                        >
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 bg-emerald/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    {student.avatar ? (
                                        <img
                                            src={student.avatar}
                                            alt={student.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-emerald font-bold text-lg">
                                            {student.name?.charAt(0) || "؟"}
                                        </span>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-emerald-deep truncate">
                                        {student.name || "طالب"}
                                    </h3>
                                    {hasPendingExcuse && (
                                        <div className="flex items-center gap-1 text-gold text-xs mt-1">
                                            <AlertTriangle size={12} />
                                            <span>يوجد عذر معلق</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status Selector */}
                                <div className="flex gap-2">
                                    {STATUS_OPTIONS.map((option) => {
                                        const isActive = currentStatus === option.value;
                                        const Icon = option.icon;

                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => updateStatus(student.id, option.value)}
                                                className={`p-2 rounded-lg transition-all ${isActive
                                                    ? option.color
                                                    : "bg-sand text-text-muted hover:bg-emerald/10"
                                                    }`}
                                                title={option.label}
                                            >
                                                <Icon size={18} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Save Button - Fixed at bottom */}
            <AnimatePresence>
                {hasChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-4 right-4 z-50 max-w-2xl mx-auto"
                    >
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full btn-primary py-4 flex items-center justify-center gap-2 shadow-elevated"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>حفظ التغييرات</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Save Message */}
            <AnimatePresence>
                {saveMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`fixed top-20 left-4 right-4 max-w-md mx-auto p-4 rounded-xl shadow-elevated ${saveMessage.type === "success"
                            ? "bg-emerald text-white"
                            : "bg-red-500 text-white"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            {saveMessage.type === "success" ? (
                                <Check size={20} />
                            ) : (
                                <X size={20} />
                            )}
                            <span>{saveMessage.text}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display */}
            {error && (
                <div className="card bg-red-50 border-red-200 text-red-600">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
