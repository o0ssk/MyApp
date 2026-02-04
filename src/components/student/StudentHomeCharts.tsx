'use client';

import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ChartData {
    monthlyChartData: { day: number; memorized: number; revised: number }[];
    weeklyChartData: { day: string; memorized: number; revised: number }[];
    pieData: { name: string; value: number; color: string }[];
}

interface StudentHomeChartsProps {
    data: ChartData;
    isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Colors (Matching Sheikh's ReportsAnalytics)
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
    emerald: '#0F3D2E',
    emeraldLight: '#10b981',
    gold: '#C7A14A',
    sand: '#F6F1E7',
    red: '#EF4444',
    blue: '#3B82F6',
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip (Matching Sheikh's Style)
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipPayload {
    value: number;
    dataKey: string;
    color?: string;
    name?: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface/95 backdrop-blur-xl border border-border p-4 rounded-xl shadow-elevated text-right min-w-[150px]">
                <p className="font-bold text-emerald-deep mb-2 font-tajawal">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-text-muted">{entry.name}:</span>
                            </div>
                            <span className="font-bold font-mono" style={{ color: entry.color }}>{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────────────────

const ChartSkeleton = ({ className = "" }: { className?: string }) => (
    <div className={`bg-surface rounded-3xl shadow-soft border border-border p-6 md:p-8 ${className}`}>
        <div className="animate-pulse">
            <div className="h-6 bg-sand rounded w-1/3 mb-2" />
            <div className="h-4 bg-sand rounded w-1/2 mb-8" />
            <div className="h-[250px] bg-sand/50 rounded-xl" />
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Chart Components
// ─────────────────────────────────────────────────────────────────────────────

// 1. Monthly Progress - Area Chart
const MonthlyProgressChart = ({ data }: { data: ChartData['monthlyChartData'] }) => {
    const hasData = data.some(d => d.memorized > 0 || d.revised > 0);

    return (
        <div className="lg:col-span-2 bg-surface rounded-3xl shadow-soft border border-border p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-emerald-deep">التقدم الشهري</h2>
                    <p className="text-sm text-text-muted mt-1">تطور الأداء خلال آخر 30 يوم</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[300px] w-full dir-ltr">
                {!hasData ? (
                    <div className="h-full flex items-center justify-center text-text-muted">
                        <p>لا توجد بيانات متاحة</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorMemorized" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRevised" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(value) => {
                                    if ([1, 5, 10, 15, 20, 25, 30].includes(value)) return String(value);
                                    return '';
                                }}
                                dy={10}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" />
                            <Area
                                type="monotone"
                                dataKey="memorized"
                                name="حفظ جديد"
                                stroke={COLORS.emerald}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorMemorized)"
                            />
                            <Area
                                type="monotone"
                                dataKey="revised"
                                name="مراجعة"
                                stroke={COLORS.gold}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevised)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

// 2. Hifz vs Review - Donut Chart
const HifzReviewDonutChart = ({ data }: { data: ChartData['pieData'] }) => {
    const totalPages = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-surface rounded-3xl shadow-soft border border-border p-6 md:p-8 flex flex-col">
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-xl font-bold text-emerald-deep">الحفظ مقابل المراجعة</h2>
                <p className="text-sm text-text-muted mt-1">توزيع الصفحات الكلي</p>
            </div>

            {/* Chart with Center Text */}
            <div className="flex-1 min-h-[250px] relative">
                {totalPages === 0 ? (
                    <div className="h-full flex items-center justify-center text-text-muted">
                        <p>لا توجد بيانات</p>
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={5}
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-emerald-deep font-tajawal">{totalPages}</span>
                            <span className="text-xs text-text-muted">صفحة</span>
                        </div>
                    </>
                )}
            </div>

            {/* Custom Legend */}
            <div className="mt-4 space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-emerald-deep">{item.name}</span>
                        </div>
                        <span className="font-bold" style={{ color: item.color }}>
                            {totalPages > 0 ? Math.round((item.value / totalPages) * 100) : 0}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. Weekly Achievement - Bar Chart
const WeeklyAchievementChart = ({ data }: { data: ChartData['weeklyChartData'] }) => {
    const hasData = data.some(d => d.memorized > 0 || d.revised > 0);

    return (
        <div className="bg-surface rounded-3xl shadow-soft border border-border p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-emerald-deep">الإنجاز الأسبوعي</h2>
                <p className="text-sm text-text-muted mt-1">مقارنة الكميات المنجزة يومياً</p>
            </div>

            {/* Chart */}
            <div className="h-[300px] w-full dir-ltr">
                {!hasData ? (
                    <div className="h-full flex items-center justify-center text-text-muted">
                        <p>لا توجد بيانات متاحة</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barSize={20} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: COLORS.sand, opacity: 0.5 }} />
                            <Legend iconType="circle" />
                            <Bar
                                dataKey="memorized"
                                name="حفظ جديد"
                                fill={COLORS.emerald}
                                radius={[4, 4, 0, 0]}
                                stackId="a"
                            />
                            <Bar
                                dataKey="revised"
                                name="مراجعة"
                                fill={COLORS.gold}
                                radius={[4, 4, 0, 0]}
                                stackId="a"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main StudentHomeCharts Component
// ─────────────────────────────────────────────────────────────────────────────

export default function StudentHomeCharts({ data, isLoading }: StudentHomeChartsProps) {
    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <ChartSkeleton className="lg:col-span-2" />
                    <ChartSkeleton />
                </div>
                <ChartSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Row 1: Area Chart (2/3) + Donut (1/3) */}
            <div className="grid lg:grid-cols-3 gap-8">
                <MonthlyProgressChart data={data.monthlyChartData} />
                <HifzReviewDonutChart data={data.pieData} />
            </div>

            {/* Row 2: Bar Chart (Full Width) */}
            <WeeklyAchievementChart data={data.weeklyChartData} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Named Exports for Individual Charts (if needed)
// ─────────────────────────────────────────────────────────────────────────────

export { MonthlyProgressChart, WeeklyAchievementChart, HifzReviewDonutChart };
