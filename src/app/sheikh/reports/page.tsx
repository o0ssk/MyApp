"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    BarChart3,
    BookOpen,
    Users,
    ClipboardCheck,
    Target,
    Download,
    RefreshCw,
    TrendingUp,
    Award,
    ChevronLeft,
    Calendar,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import { useSheikhCircles } from "@/lib/hooks/useSheikh";
import { useCircleStats, exportToCSV } from "@/lib/hooks/useReports";
import { useToast } from "@/components/ui/Toast";

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

// Theme colors
const COLORS = {
    emerald: "#2d7a5e",
    gold: "#c9a94a",
    sand: "#f8f5ef",
    red: "#ef4444",
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

    // Pie chart data
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
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
            >
                <div>
                    <h1 className="text-2xl font-bold text-emerald-deep flex items-center gap-2">
                        <BarChart3 size={28} className="text-gold" />
                        التقارير والإحصائيات
                    </h1>
                    <p className="text-text-muted">تحليل أداء الحلقات والطلاب</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleExport}>
                        <Download size={18} />
                        تصدير CSV
                    </Button>
                </div>
            </motion.div>

            {/* Month Selector */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6"
            >
                <Card>
                    <CardContent className="flex items-center justify-between py-3">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 rounded-lg hover:bg-sand transition-colors"
                        >
                            <ChevronLeft size={20} className="rotate-180" />
                        </button>
                        <div className="flex items-center gap-2 text-emerald-deep font-bold">
                            <Calendar size={20} className="text-gold" />
                            {monthLabel}
                        </div>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 rounded-lg hover:bg-sand transition-colors"
                            disabled={selectedMonth === now.getMonth() && selectedYear === now.getFullYear()}
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="h-24" />
                            </Card>
                        ))}
                    </div>
                    <Card className="animate-pulse">
                        <CardContent className="h-64" />
                    </Card>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <Card>
                    <EmptyState
                        icon={<BarChart3 size={40} />}
                        title="خطأ في التحميل"
                        description={error}
                    />
                </Card>
            )}

            {/* No Data State */}
            {!isLoading && !error && !hasData && (
                <Card>
                    <EmptyState
                        icon={<TrendingUp size={40} />}
                        title="لا توجد بيانات كافية"
                        description="سيتم عرض التحليلات عند توفر سجلات معتمدة"
                    />
                </Card>
            )}

            {/* Stats Content */}
            {!isLoading && !error && stats && (
                <>
                    {/* Summary Cards */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                    >
                        <motion.div variants={listItem}>
                            <StatCard
                                icon={<BookOpen size={24} />}
                                label="صفحات الحفظ"
                                value={stats.totalPagesMemorized}
                                color="emerald"
                            />
                        </motion.div>
                        <motion.div variants={listItem}>
                            <StatCard
                                icon={<RefreshCw size={24} />}
                                label="صفحات المراجعة"
                                value={stats.totalPagesRevised}
                                color="gold"
                            />
                        </motion.div>
                        <motion.div variants={listItem}>
                            <StatCard
                                icon={<Users size={24} />}
                                label="طلاب نشطون"
                                value={stats.activeStudents}
                                color="emerald"
                            />
                        </motion.div>
                        <motion.div variants={listItem}>
                            <StatCard
                                icon={<Target size={24} />}
                                label="نسبة الإكمال"
                                value={`${stats.completionRate}%`}
                                color="gold"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Activity Line Chart */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="lg:col-span-2"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp size={20} className="text-emerald" />
                                        نشاط الأسبوع
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={stats.dailyActivity}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={formatChartDate}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "#fff",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "12px",
                                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                                    }}
                                                    labelFormatter={(label) => formatChartDate(String(label))}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="memorized"
                                                    name="حفظ"
                                                    stroke={COLORS.emerald}
                                                    strokeWidth={2}
                                                    dot={{ fill: COLORS.emerald }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="revised"
                                                    name="مراجعة"
                                                    stroke={COLORS.gold}
                                                    strokeWidth={2}
                                                    dot={{ fill: COLORS.gold }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Status Pie Chart */}
                        <motion.div variants={fadeUp} initial="hidden" animate="visible">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardCheck size={20} className="text-gold" />
                                        حالة السجلات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {pieData.length > 0 ? (
                                        <div className="h-48">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={60}
                                                        label={({ name, percent }) =>
                                                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                                                        }
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="h-48 flex items-center justify-center text-text-muted">
                                            لا توجد سجلات
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Top Performers */}
                    <motion.div variants={fadeUp} initial="hidden" animate="visible">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award size={20} className="text-gold" />
                                    الأفضل أداءً هذا الشهر
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.topPerformers.length === 0 ? (
                                    <div className="text-center py-8 text-text-muted">
                                        <Award size={40} className="mx-auto mb-2 opacity-50" />
                                        <p>لا توجد بيانات كافية لعرض الترتيب</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {stats.topPerformers.map((student, index) => (
                                            <Link
                                                key={student.id}
                                                href={`/sheikh/students/${student.id}`}
                                            >
                                                <div className="flex items-center justify-between p-4 bg-sand rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                                                    <div className="flex items-center gap-4">
                                                        {/* Rank Badge */}
                                                        <div
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0
                                                                ? "bg-gold"
                                                                : index === 1
                                                                    ? "bg-gray-400"
                                                                    : "bg-amber-600"
                                                                }`}
                                                        >
                                                            {index + 1}
                                                        </div>

                                                        {/* Avatar */}
                                                        <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center overflow-hidden">
                                                            {student.avatar ? (
                                                                <img
                                                                    src={student.avatar}
                                                                    alt={student.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="font-bold text-emerald">
                                                                    {student.name.charAt(0)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Name */}
                                                        <span className="font-medium text-emerald-deep">
                                                            {student.name}
                                                        </span>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="text-left">
                                                        <p className="text-lg font-bold text-emerald-deep">
                                                            {student.totalPages}
                                                        </p>
                                                        <p className="text-xs text-text-muted">صفحة</p>
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

// Stat Card Component
function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: "emerald" | "gold";
}) {
    const bgColor = color === "emerald" ? "bg-emerald/10" : "bg-gold/10";
    const textColor = color === "emerald" ? "text-emerald" : "text-gold";

    return (
        <Card>
            <CardContent className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${bgColor} ${textColor}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-emerald-deep">{value}</p>
                    <p className="text-sm text-text-muted">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}
