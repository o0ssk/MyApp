"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    BarChart3,
    BookOpen,
    Users,
    Target,
    Download,
    RefreshCw,
    Award,
    ChevronLeft,
    Calendar,
    TrendingUp,
} from "lucide-react";

import { useSheikhCircles } from "@/lib/hooks/useSheikh";
import { useCircleStats, exportToCSV } from "@/lib/hooks/useReports";
import { useToast } from "@/components/ui/Toast";
import { ReportsAnalytics } from "@/components/sheikh/ReportsAnalytics";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { StudentBadge } from "@/components/ui/StudentBadge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { staggerContainer, fadeUp, listItem } from "@/lib/motion";

// Arabic month names
const ARABIC_MONTHS = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

// Arabic day names (short)
const ARABIC_DAYS: Record<string, string> = {
    "0": "الأحد",
    "1": "الإثنين",
    "2": "الثلاثاء",
    "3": "الأربعاء",
    "4": "الخميس",
    "5": "الجمعة",
    "6": "السبت",
};

// Theme colors (Matching globals)
const COLORS = {
    emerald: "#0F3D2E",
    gold: "#C7A14A",
    red: "#EF4444",
};

export default function ReportsPage() {
    const { circles, isLoading: circlesLoading } = useSheikhCircles();
    const circleIds = useMemo(() => circles.map((c) => c.id), [circles]);
    const { showToast } = useToast();

    // Month selector
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

    const { stats, isLoading: statsLoading, error } = useCircleStats(
        circleIds,
        selectedYear,
        selectedMonth
    );

    const isLoading = circlesLoading || statsLoading;
    const monthLabel = `${ARABIC_MONTHS[selectedMonth]} ${selectedYear}`;

    // Handle previous/next month
    const handlePrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    // Handle CSV export
    const handleExport = () => {
        if (stats && stats.allStudentStats.length > 0) {
            exportToCSV(stats.allStudentStats, monthLabel);
            showToast("تم تحميل التقرير بنجاح", "success");
        } else {
            showToast("لا توجد بيانات للتصدير", "error");
        }
    };

    // Format date for chart
    const formatChartDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const dayNum = date.getDay();
        return ARABIC_DAYS[dayNum.toString()] || dateStr.slice(5);
    };

    // Pie chart data structure
    const pieData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: "معتمد", value: stats.statusBreakdown.approved, color: COLORS.emerald },
            { name: "مرفوض", value: stats.statusBreakdown.rejected, color: COLORS.red },
            { name: "قيد المراجعة", value: stats.statusBreakdown.pending, color: COLORS.gold },
        ].filter((d) => d.value > 0);
    }, [stats]);

    // Check if we have data
    const hasData = stats && (
        stats.totalPagesMemorized > 0 ||
        stats.totalPagesRevised > 0 ||
        stats.topPerformers.length > 0
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-emerald-deep flex items-center gap-3">
                        <BarChart3 size={32} className="text-gold" />
                        التقارير والإحصائيات
                    </h1>
                    <p className="text-text-muted mt-1">تحليل شامل لأداء حلقاتك وتقدم الطلاب</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleExport} className="border-emerald/20 hover:bg-emerald/5">
                        <Download size={18} className="ml-2 text-emerald" />
                        تصدير Excel
                    </Button>
                </div>
            </motion.div>

            {/* Month Selector */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-8"
            >
                <div className="bg-surface rounded-2xl border border-border shadow-sm p-2 max-w-md">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 rounded-xl hover:bg-sand transition-colors text-emerald-deep"
                        >
                            <ChevronLeft size={24} className="rotate-180" />
                        </button>
                        <div className="flex items-center gap-3 text-emerald-deep font-bold text-lg">
                            <Calendar size={24} className="text-gold" />
                            {monthLabel}
                        </div>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 rounded-xl hover:bg-sand transition-colors text-emerald-deep"
                            disabled={selectedMonth === now.getMonth() && selectedYear === now.getFullYear()}
                        >
                            <ChevronLeft size={24} className={`${selectedMonth === now.getMonth() && selectedYear === now.getFullYear() ? 'opacity-30' : ''}`} />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-surface/50 rounded-2xl animate-pulse border border-border/50" />
                        ))}
                    </div>
                    <div className="h-96 bg-surface/50 rounded-2xl animate-pulse border border-border/50" />
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                    <BarChart3 size={48} className="mx-auto text-red-300 mb-4" />
                    <h3 className="text-xl font-bold text-red-900 mb-2">تعذر تحميل البيانات</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* No Data State */}
            {!isLoading && !error && !hasData && (
                <div className="bg-surface border border-dashed border-border rounded-3xl p-12 text-center">
                    <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center mx-auto mb-6">
                        <TrendingUp size={40} className="text-emerald/40" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-deep mb-2">لا توجد بيانات لهذا الشهر</h3>
                    <p className="text-text-muted">لم يتم تسجيل أي عمليات حفظ أو مراجعة في الفترة المحددة</p>
                </div>
            )}

            {/* Content */}
            {!isLoading && !error && stats && hasData && (
                <>
                    {/* Summary Cards */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
                    >
                        <motion.div variants={listItem}>
                            <StatCard
                                icon={<BookOpen size={24} />}
                                label="إجمالي الحفظ"
                                value={stats.totalPagesMemorized}
                                subValue="صفحة"
                                color="emerald"
                            />
                        </motion.div>
                        <motion.div variants={listItem}>
                            <StatCard
                                icon={<RefreshCw size={24} />}
                                label="إجمالي المراجعة"
                                value={stats.totalPagesRevised}
                                subValue="صفحة"
                                color="gold"
                            />
                        </motion.div>
                        <motion.div variants={listItem}>
                            <StatCard
                                icon={<Users size={24} />}
                                label="الطلاب النشطون"
                                value={stats.activeStudents}
                                subValue="طالب"
                                color="emerald"
                            />
                        </motion.div>
                        <motion.div variants={listItem}>
                            <StatCard
                                icon={<Target size={24} />}
                                label="نسبة الإكمال"
                                value={stats.completionRate}
                                subValue="%"
                                color="gold"
                            />
                        </motion.div>
                    </motion.div>

                    {/* NEW: Advanced Analytics Section */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="mb-8"
                    >
                        <ReportsAnalytics
                            dailyActivity={stats.dailyActivity}
                            pieData={pieData}
                            formatDate={formatChartDate}
                        />
                    </motion.div>

                    {/* Top Performers Section */}
                    <motion.div variants={fadeUp} initial="hidden" animate="visible">
                        <Card className="border-border shadow-soft bg-surface overflow-hidden">
                            <CardHeader className="border-b border-border/50 bg-sand/30">
                                <CardTitle className="flex items-center gap-3 text-emerald-deep">
                                    <div className="p-2 bg-gold/10 rounded-lg">
                                        <Award size={24} className="text-gold" />
                                    </div>
                                    فرسان الحلقة (الأكثر إنجازاً)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {stats.topPerformers.length === 0 ? (
                                    <div className="text-center py-8 text-text-muted">
                                        <p>لا توجد بيانات كافية لعرض الترتيب</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {stats.topPerformers.map((student, index) => (
                                            <Link
                                                key={student.id}
                                                href={`/sheikh/students/${student.id}`}
                                                className="group"
                                            >
                                                <div className="flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:border-emerald/30 hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-4">
                                                        {/* Rank Badge */}
                                                        <div
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                                                : index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500"
                                                                    : "bg-gradient-to-br from-amber-600 to-amber-800"
                                                                }`}
                                                        >
                                                            {index + 1}
                                                        </div>

                                                        {/* Avatar & Name */}
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12">
                                                                <StudentAvatar
                                                                    student={{
                                                                        name: student.name,
                                                                        photoURL: student.avatar,
                                                                        equippedFrame: student.equippedFrame,
                                                                        equippedBadge: student.equippedBadge,
                                                                        equippedAvatar: student.equippedAvatar
                                                                    }}
                                                                    size="md"
                                                                    className="w-full h-full"
                                                                />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-emerald-deep group-hover:text-emerald transition-colors flex items-center gap-1">
                                                                    {student.name}
                                                                    <StudentBadge badgeId={student.equippedBadge} size="sm" />
                                                                </h4>
                                                                <p className="text-xs text-text-muted">المستوى المتقدم</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Score */}
                                                    <div className="text-center bg-sand/50 px-4 py-2 rounded-lg">
                                                        <p className="text-xl font-bold text-emerald-deep">{student.totalPages}</p>
                                                        <p className="text-[10px] text-text-muted font-bold">صفحة</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </>
            )}
        </div>
    );
}

// Improved Stat Card Component
function StatCard({
    icon,
    label,
    value,
    subValue,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subValue?: string;
    color: "emerald" | "gold";
}) {
    const isEmerald = color === "emerald";

    return (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${isEmerald ? 'bg-emerald/10 text-emerald' : 'bg-gold/10 text-gold'}`}>
                    {icon}
                </div>
                {isEmerald && <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />}
            </div>
            <div>
                <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold font-tajawal ${isEmerald ? 'text-emerald-deep' : 'text-emerald-deep'}`}>
                        {value}
                    </span>
                    {subValue && <span className="text-xs text-text-muted font-medium">{subValue}</span>}
                </div>
                <p className="text-sm text-text-muted mt-1 font-medium">{label}</p>
            </div>
        </div>
    );
}