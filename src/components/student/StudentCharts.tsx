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
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data Generation
// ─────────────────────────────────────────────────────────────────────────────

// Monthly Progress Data (30 days)
const generateMonthlyData = () => {
    const data = [];
    for (let i = 1; i <= 30; i++) {
        data.push({
            day: i,
            pages: Math.floor(Math.random() * 40) + 20 + Math.sin(i / 5) * 15,
        });
    }
    return data;
};

// Weekly Achievement Data (7 days)
const generateWeeklyData = () => {
    const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    return days.map((day) => ({
        day,
        memorized: Math.floor(Math.random() * 8) + 2,
        reviewed: Math.floor(Math.random() * 12) + 5,
    }));
};

// Hifz vs Review Data
const hifzReviewData = [
    { name: 'الحفظ', value: 145, color: '#0D9488' },
    { name: 'المراجعة', value: 230, color: '#8B5CF6' },
];

const monthlyData = generateMonthlyData();
const weeklyData = generateWeeklyData();

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip Components
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

const MonthlyTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-elevated border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">اليوم {label}</p>
                <p className="text-sm font-bold text-emerald-deep">
                    {payload[0].value} صفحة
                </p>
            </div>
        );
    }
    return null;
};

const WeeklyTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-elevated border border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-semibold">{label}</p>
                <div className="space-y-1.5">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-600">
                                {entry.dataKey === 'memorized' ? 'الحفظ' : 'المراجعة'}:
                            </span>
                            <span className="font-bold text-gray-900">{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Chart Components
// ─────────────────────────────────────────────────────────────────────────────

// 1. Monthly Progress - The "Wave"
const MonthlyProgressChart = () => {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-soft transition-shadow duration-300">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">التقدم الشهري</h3>
                <p className="text-sm text-gray-500">عدد الصفحات المنجزة خلال الشهر</p>
            </div>

            {/* Chart */}
            <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        {/* Gradient Definition */}
                        <defs>
                            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => {
                                if ([1, 5, 10, 15, 20, 25, 30].includes(value)) return value;
                                return '';
                            }}
                        />
                        <YAxis hide />
                        <Tooltip content={<MonthlyTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="pages"
                            stroke="#10B981"
                            strokeWidth={3}
                            fill="url(#emeraldGradient)"
                            dot={false}
                            activeDot={{
                                r: 6,
                                stroke: '#fff',
                                strokeWidth: 2,
                                fill: '#10B981',
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-gray-600">المتوسط اليومي:</span>
                </div>
                <span className="text-sm font-bold text-emerald-600">
                    {Math.round(monthlyData.reduce((a, b) => a + b.pages, 0) / 30)} صفحة
                </span>
            </div>
        </div>
    );
};

// 2. Weekly Achievement - The "Rounded Bars"
const WeeklyAchievementChart = () => {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-soft transition-shadow duration-300">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">الإنجاز الأسبوعي</h3>
                <p className="text-sm text-gray-500">مقارنة الحفظ والمراجعة</p>
            </div>

            {/* Chart */}
            <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        {/* Gradient Definitions */}
                        <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                                <stop offset="100%" stopColor="#D97706" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                                <stop offset="100%" stopColor="#4F46E5" stopOpacity={1} />
                            </linearGradient>
                        </defs>

                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 11 }}
                        />
                        <YAxis hide />
                        <Tooltip content={<WeeklyTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                        <Bar
                            dataKey="memorized"
                            fill="url(#goldGradient)"
                            radius={[4, 4, 0, 0]}
                            barSize={14}
                        />
                        <Bar
                            dataKey="reviewed"
                            fill="url(#blueGradient)"
                            radius={[4, 4, 0, 0]}
                            barSize={14}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-gray-600">الحفظ</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-sm text-gray-600">المراجعة</span>
                </div>
            </div>
        </div>
    );
};

// 3. Hifz vs Review - The "Donut"
const HifzReviewDonutChart = () => {
    const totalPages = hifzReviewData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-soft transition-shadow duration-300">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">الحفظ مقابل المراجعة</h3>
                <p className="text-sm text-gray-500">توزيع الصفحات الكلي</p>
            </div>

            {/* Chart with Center Text */}
            <div className="h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={hifzReviewData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                        >
                            {hifzReviewData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-elevated border border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: data.color }}
                                                />
                                                <span className="text-sm text-gray-600">{data.name}:</span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {data.value} صفحة
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-900">{totalPages}</span>
                    <span className="text-xs text-gray-500">صفحة</span>
                </div>
            </div>

            {/* Legend Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-8">
                {hifzReviewData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600">{item.name}</span>
                        <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main StudentCharts Component
// ─────────────────────────────────────────────────────────────────────────────

export default function StudentCharts() {
    return (
        <section className="py-6">
            {/* Section Header */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">الإحصائيات</h2>
                <p className="text-sm text-gray-500">تتبع تقدمك في الحفظ والمراجعة</p>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MonthlyProgressChart />
                <WeeklyAchievementChart />
                <HifzReviewDonutChart />
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Named Exports for Individual Charts (if needed)
// ─────────────────────────────────────────────────────────────────────────────

export { MonthlyProgressChart, WeeklyAchievementChart, HifzReviewDonutChart };
