"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    BookOpen,
    RotateCcw,
    Plus,
    Clock,
    RefreshCw,
    Users,
    ChevronLeft,
    PlusCircle,
    ClipboardList,
    CheckCircle2,
} from "lucide-react";

import StudentHomeCharts from "@/components/student/StudentHomeCharts";
import GoalTracker from "@/components/student/GoalTracker";
import HeaderWidget from "@/components/student/HeaderWidget";

import { useAuth } from "@/lib/auth/hooks";
import { useMembership } from "@/lib/hooks/useMembership";
import { useTasks, Task } from "@/lib/hooks/useTasks";
import { useLogs } from "@/lib/hooks/useLogs";
import { useToast } from "@/components/ui/Toast";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton, StatSkeleton } from "@/components/ui/Skeleton";
import { fadeUp, listItem, staggerContainer } from "@/lib/motion";

import { collection, query as firestoreQuery, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { StudentBadge } from "@/components/ui/StudentBadge";

export default function StudentDashboardPage() {
    const { userProfile } = useAuth();
    const { activeCircle, hasApprovedMembership, hasPendingMembership, isLoading: membershipLoading } = useMembership();
    const { memorizationTask, revisionTask, isLoading: tasksLoading, submitTask } = useTasks(activeCircle?.id || null);
    const { recentLogs, stats, isLoading: logsLoading, addLog } = useLogs(activeCircle?.id || null);
    const { showToast } = useToast();

    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showAddLogModal, setShowAddLogModal] = useState(false);
    const [addLogType, setAddLogType] = useState<"memorization" | "revision">("memorization");
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const openAddLogModal = (type: "memorization" | "revision", taskId?: string) => {
        setAddLogType(type);
        setSelectedTaskId(taskId || null);
        setShowAddLogModal(true);
    };

    const isLoading = membershipLoading || tasksLoading || logsLoading;
    const monthlyGoal = userProfile?.settings?.goals?.monthlyPagesTarget || 30;
    const progress = Math.min(stats.totalPagesThisMonth / monthlyGoal, 1);

    // Build chart data from stats
    const chartData = useMemo(() => ({
        monthlyChartData: stats.monthlyChartData || [],
        weeklyChartData: stats.weeklyChartData || [],
        pieData: [
            { name: 'الحفظ', value: stats.memorizationPages, color: '#0F3D2E' },
            { name: 'المراجعة', value: stats.revisionPages, color: '#C7A14A' },
        ],
    }), [stats]);

    // DEBUG: Log all tasks for user to verify visibility
    useEffect(() => {
        if (!userProfile?.uid) return;
        const debugFetch = async () => {
            console.log("🐛 DEBUG - Fetching ALL tasks for student:", userProfile.uid);
            try {
                // Use alias to avoid conflict or just usage strictly
                const q = firestoreQuery(collection(db, 'tasks'), where('studentId', '==', userProfile.uid));
                const snap = await getDocs(q);
                console.log("🐛 DEBUG - ALL TASKS IN DB:", snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) {
                console.error("🐛 DEBUG - Error fetching tasks:", e);
            }
        };
        debugFetch();
    }, [userProfile?.uid]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            {/* Header with Greeting and Widget */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">

                {/* 1. Profile Section (Right in Desktop RTL / Top in Mobile) */}
                <div className="w-full md:w-auto flex justify-center md:justify-start order-1">
                    <div className="flex items-center gap-3 md:gap-4">
                        <StudentAvatar
                            student={{
                                name: userProfile?.name || "طالب",
                                photoURL: userProfile?.photoURL,
                                equippedFrame: userProfile?.equippedFrame,
                                equippedBadge: userProfile?.equippedBadge,
                                equippedAvatar: userProfile?.equippedAvatar,
                            }}
                            size="xl"
                            className="shadow-sm"
                        />
                        <div className="text-center md:text-right">
                            <h1 className="text-lg md:text-xl font-bold text-emerald-deep flex items-center justify-center md:justify-start gap-2">
                                أهلاً، {userProfile?.name || "طالب"}
                                <StudentBadge badgeId={userProfile?.equippedBadge} />
                            </h1>
                            {activeCircle && (
                                <p className="text-xs md:text-sm text-text-muted">{activeCircle.name}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Widget Section (Left in Desktop RTL / Bottom in Mobile) */}
                <div className="w-full md:w-auto order-2">
                    <HeaderWidget />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-4">
                    <StatSkeleton />
                    <div className="grid md:grid-cols-2 gap-4">
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                </div>
            )}

            {/* No Membership State */}
            {!isLoading && !hasApprovedMembership && !hasPendingMembership && (
                <motion.div variants={fadeUp}>
                    <Card variant="gradient" className="text-center py-12">
                        <EmptyState
                            icon={<Users size={40} />}
                            title="لم تنضم إلى حلقة بعد"
                            description="انضم إلى حلقة تحفيظ باستخدام رمز الدعوة من شيخك"
                            action={{
                                label: "انضم برمز الدعوة",
                                onClick: () => setShowJoinModal(true),
                            }}
                        />
                    </Card>
                </motion.div>
            )}

            {/* Pending Membership State */}
            {!isLoading && hasPendingMembership && !hasApprovedMembership && (
                <motion.div variants={fadeUp}>
                    <Card variant="gold" className="text-center py-8">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4">
                                <Clock size={32} className="text-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-deep mb-2">
                                طلب الانضمام قيد المراجعة
                            </h3>
                            <p className="text-text-muted mb-6">
                                سيتم إعلامك عند قبول طلبك من قبل الشيخ
                            </p>
                            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                                <RefreshCw size={16} />
                                تحديث الحالة
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Main Dashboard (Approved Membership) */}
            {!isLoading && hasApprovedMembership && (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Stats Row */}
                    <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card hover>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-deep">{stats.totalPagesThisMonth}</div>
                                <div className="text-sm text-text-muted">صفحة هذا الشهر</div>
                            </div>
                        </Card>
                        <Card hover>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gold">{stats.totalPagesThisWeek}</div>
                                <div className="text-sm text-text-muted">صفحة هذا الأسبوع</div>
                            </div>
                        </Card>
                        <Card hover>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald">{stats.memorizationPages}</div>
                                <div className="text-sm text-text-muted">صفحات حفظ</div>
                            </div>
                        </Card>
                        <Card hover>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald">{stats.revisionPages}</div>
                                <div className="text-sm text-text-muted">صفحات مراجعة</div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Goal Tracker */}
                    <motion.div variants={fadeUp}>
                        <GoalTracker circleId={activeCircle?.id || null} />
                    </motion.div>

                    {/* Quick Action Buttons */}
                    <motion.div variants={fadeUp}>
                        <h2 className="text-lg font-bold text-emerald-deep mb-4">تسجيل الإنجازات</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Hifz Action Button */}
                            <Card
                                hover
                                onClick={() => openAddLogModal("memorization")}
                                className="cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald to-emerald-deep flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <PlusCircle className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-emerald-deep text-lg">تسجيل إنجاز حفظ</div>
                                        <div className="text-sm text-text-muted">أضف صفحات الحفظ الجديدة</div>
                                    </div>
                                </div>
                            </Card>

                            {/* Review Action Button */}
                            <Card
                                hover
                                onClick={() => openAddLogModal("revision")}
                                className="cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <RefreshCw className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-emerald-deep text-lg">تسجيل إنجاز مراجعة</div>
                                        <div className="text-sm text-text-muted">أضف صفحات المراجعة</div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>

                    {/* Assigned Tasks Section (Central) */}
                    <motion.div variants={fadeUp}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald/10 rounded-xl">
                                    <ClipboardList className="w-5 h-5 text-emerald" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-emerald-deep">المهام المطلوبة اليوم</h2>
                                    <p className="text-sm text-text-muted">المهام المكلفة من الشيخ</p>
                                </div>
                            </div>
                        </div>

                        {/* Tasks List */}
                        {!memorizationTask && !revisionTask ? (
                            <Card className="py-8">
                                <EmptyState
                                    icon={<CheckCircle2 size={40} className="text-emerald" />}
                                    title="لا توجد مهام لليوم"
                                    description="لم يكلّفك الشيخ بأي مهام حالياً. يمكنك تسجيل إنجازاتك يدوياً."
                                />
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {memorizationTask && (
                                    <AssignedTaskItem
                                        task={memorizationTask}
                                        type="memorization"
                                        onSubmit={submitTask}
                                        onAddLog={() => openAddLogModal("memorization", memorizationTask.id)}
                                    />
                                )}
                                {revisionTask && (
                                    <AssignedTaskItem
                                        task={revisionTask}
                                        type="revision"
                                        onSubmit={submitTask}
                                        onAddLog={() => openAddLogModal("revision", revisionTask.id)}
                                    />
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Performance Analytics Charts */}
                    <motion.div variants={fadeUp}>
                        <StudentHomeCharts data={chartData} isLoading={logsLoading} />
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div variants={fadeUp}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-emerald-deep">النشاط الأخير</h2>
                            <Link href="/app/log">
                                <Button variant="ghost" size="sm">
                                    عرض الكل
                                    <ChevronLeft size={16} />
                                </Button>
                            </Link>
                        </div>
                        {recentLogs.length === 0 ? (
                            <Card>
                                <EmptyState
                                    icon={<Clock size={32} />}
                                    title="لا يوجد نشاط بعد"
                                    description="ابدأ بتسجيل إنجازك اليوم"
                                    action={{
                                        label: "تسجيل إنجاز",
                                        onClick: () => openAddLogModal("memorization"),
                                    }}
                                />
                            </Card>
                        ) : (
                            <motion.div variants={staggerContainer} className="space-y-2">
                                {recentLogs.map((log) => (
                                    <motion.div key={log.id} variants={listItem}>
                                        <Card hover className="flex items-center gap-4 p-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.type === "memorization" ? "bg-gold/10 text-gold" : "bg-emerald/10 text-emerald"
                                                }`}>
                                                {log.type === "memorization" ? <BookOpen size={20} /> : <RotateCcw size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-emerald-deep">
                                                    {log.type === "memorization" ? "حفظ" : "مراجعة"} {log.amount.pages || 0} صفحة
                                                </div>
                                                <div className="text-sm text-text-muted">
                                                    {new Date(log.createdAt).toLocaleDateString("ar-SA")}
                                                </div>
                                            </div>
                                            <StatusBadge status={log.status} />
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Floating Add Button */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="fixed bottom-24 left-6"
                    >
                        <Button
                            variant="gold"
                            size="lg"
                            className="rounded-full w-14 h-14 shadow-lg"
                            onClick={() => openAddLogModal("memorization")}
                        >
                            <Plus size={24} />
                        </Button>
                    </motion.div>
                </motion.div>
            )}

            {/* Modals */}
            <JoinCircleModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
            <AddLogModal
                isOpen={showAddLogModal}
                onClose={() => setShowAddLogModal(false)}
                type={addLogType}
                circleId={activeCircle?.id || null}
                onSuccess={() => {
                    setShowAddLogModal(false);
                    showToast("تم تسجيل الإنجاز بنجاح", "success");
                }}
            />
        </div>
    );
}

// Task Card Component
function TaskCard({
    type,
    task,
    onSubmit,
    onAddLog
}: {
    type: "memorization" | "revision";
    task?: Task;
    onSubmit: (task: Task) => Promise<{ success: boolean; error?: string }>;
    onAddLog: () => void;
}) {
    const isMemorization = type === "memorization";
    const icon = isMemorization ? <BookOpen size={24} /> : <RotateCcw size={24} />;
    const title = isMemorization ? "الحفظ" : "المراجعة";
    const iconBg = isMemorization ? "bg-gold/10 text-gold" : "bg-emerald/10 text-emerald";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async () => {
        if (!task) return;

        setIsSubmitting(true);
        const result = await onSubmit(task);
        setIsSubmitting(false);

        if (result.success) {
            showToast("تم إرسال الإنجاز للشيخ بنجاح", "success");
        } else {
            showToast(result.error || "حدث خطأ أثناء الإرسال", "error");
        }
    };

    if (!task) {
        return (
            <Card hover className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
                <div className="flex-1">
                    <div className="font-bold text-emerald-deep">{title}</div>
                    <div className="text-sm text-text-muted">لا توجد مهام حالياً</div>
                </div>
                <Button variant="ghost" size="sm" onClick={onAddLog}>
                    <Plus size={16} />
                    تسجيل
                </Button>
            </Card>
        );
    }

    const targetText = task.target.pages
        ? `${task.target.pages} صفحة`
        : `${task.target.surah} (${task.target.ayahFrom}-${task.target.ayahTo})`;

    const isToday = task.dueDate === new Date().toISOString().split("T")[0];
    const dateDisplay = isToday ? "اليوم" : new Date(task.dueDate).toLocaleDateString("ar-SA", { weekday: "short", day: "numeric", month: "short" });

    return (
        <Card hover className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-deep">{title}</span>
                    <StatusBadge status={task.status} />
                </div>
                <div className="text-sm text-text-muted">
                    {targetText}
                    <span className="mx-2 text-gray-300">|</span>
                    <span className={isToday ? "text-emerald font-medium" : "text-amber-600"}>{dateDisplay}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="gold"
                    size="sm"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                >
                    تسجيل إنجاز
                </Button>
                <Link href="/app/log">
                    <Button variant="ghost" size="sm">السجل</Button>
                </Link>
            </div>
        </Card>
    );
}

// Assigned Task Item Component (for central list)
function AssignedTaskItem({
    task,
    type,
    onSubmit,
    onAddLog
}: {
    task: Task;
    type: "memorization" | "revision";
    onSubmit: (task: Task) => Promise<{ success: boolean; error?: string }>;
    onAddLog: () => void;
}) {
    const isMemorization = type === "memorization";
    const icon = isMemorization ? <BookOpen size={20} /> : <RotateCcw size={20} />;
    const iconBg = isMemorization ? "bg-emerald/10 text-emerald" : "bg-gold/10 text-gold";
    const typeLabel = isMemorization ? "حفظ" : "مراجعة";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const result = await onSubmit(task);
        setIsSubmitting(false);

        if (result.success) {
            showToast("تم إرسال الإنجاز للشيخ بنجاح", "success");
        } else {
            showToast(result.error || "حدث خطأ أثناء الإرسال", "error");
        }
    };

    // Format target text
    const targetText = task.target.pages
        ? `${task.target.pages} صفحة`
        : task.target.surah
            ? `${task.target.surah} (آية ${task.target.ayahFrom || 1} - ${task.target.ayahTo || ""})`
            : "غير محدد";

    // Date display
    const isToday = task.dueDate === new Date().toISOString().split("T")[0];
    const dateDisplay = isToday
        ? "اليوم"
        : new Date(task.dueDate).toLocaleDateString("ar-SA", { weekday: "short", day: "numeric", month: "short" });

    return (
        <Card className={`p-4 border-r-4 ${isMemorization ? 'border-r-emerald' : 'border-r-gold'}`}>
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-emerald-deep">{typeLabel}</span>
                        <StatusBadge status={task.status} />
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isToday ? "bg-emerald/10 text-emerald" : "bg-amber-100 text-amber-700"}`}>
                            {dateDisplay}
                        </span>
                    </div>

                    {/* Task Details */}
                    <div className="mt-2 p-3 bg-sand/50 rounded-xl">
                        <p className="text-emerald-deep font-medium">{targetText}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                        variant="gold"
                        size="sm"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                    >
                        <CheckCircle2 size={16} />
                        <span className="mr-1">إنجاز</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onAddLog}>
                        <Plus size={16} />
                        <span className="mr-1">تسجيل</span>
                    </Button>
                </div>
            </div>
        </Card>
    );
}

// JoinCircleModal and AddLogModal previously defined
// Join Circle Modal
function JoinCircleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { joinCircleByCode } = useMembership();
    const { showToast } = useToast();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) {
            setError("الرجاء إدخال رمز الدعوة");
            return;
        }
        setIsLoading(true);
        setError(null);
        const result = await joinCircleByCode(code.trim());
        setIsLoading(false);
        if (result.success) {
            showToast("تم إرسال طلب الانضمام بنجاح", "success");
            onClose();
            setCode("");
        } else {
            setError(result.error || "حدث خطأ");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="انضم إلى حلقة">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">رمز الدعوة</label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="أدخل رمز الدعوة"
                        className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text text-center text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-gold/50"
                        dir="ltr"
                        maxLength={8}
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <p className="text-sm text-text-muted">احصل على رمز الدعوة من شيخ الحلقة للانضمام</p>
                <Button type="submit" variant="gold" className="w-full" isLoading={isLoading}>
                    إرسال طلب الانضمام
                </Button>
            </form>
        </Modal>
    );
}

// Add Log Modal
function AddLogModal({
    isOpen,
    onClose,
    type,
    circleId,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    type: "memorization" | "revision";
    circleId: string | null;
    onSuccess: () => void;
}) {
    const { addLog } = useLogs(circleId);
    const [logType, setLogType] = useState(type);
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
            onSuccess();
            setPages("");
            setNotes("");
        } else {
            setError(result.error || "حدث خطأ");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="تسجيل إنجاز" size="md">
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
                    تسجيل الإنجاز
                </Button>
            </form>
        </Modal>
    );
}
