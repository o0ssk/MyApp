"use client";

import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";

// --- الألوان والهوية البصرية ---
const COLORS = {
    emerald: "#0F3D2E",
    emeraldLight: "#10b981",
    gold: "#C7A14A",
    sand: "#F6F1E7",
    red: "#EF4444",
    blue: "#3B82F6",
};

// --- مكون التلميح المخصص (Custom Tooltip) ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface/95 backdrop-blur-xl border border-border p-4 rounded-xl shadow-elevated text-right min-w-[150px]">
                <p className="font-bold text-emerald-deep mb-2 font-tajawal">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry: any, idx: number) => (
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

interface ReportsAnalyticsProps {
    dailyActivity: any[];
    pieData: any[];
    formatDate: (date: string) => string;
}

export function ReportsAnalytics({ dailyActivity, pieData, formatDate }: ReportsAnalyticsProps) {

    // حساب إجمالي الحالات للدونات
    const totalRecords = pieData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="space-y-8">

            <div className="grid lg:grid-cols-3 gap-8">
                {/* 1. مخطط النشاط (Area Chart) - يأخذ ثلثي المساحة */}
                <div className="lg:col-span-2 bg-surface rounded-3xl shadow-soft border border-border p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-emerald-deep">منحنى الحفظ والمراجعة</h2>
                            <p className="text-sm text-text-muted mt-1">تطور الأداء خلال الأيام المسجلة</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full dir-ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyActivity} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={formatDate}
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
                    </div>
                </div>

                {/* 2. مخطط الحالات (Donut Chart) - يأخذ الثلث المتبقي */}
                <div className="bg-surface rounded-3xl shadow-soft border border-border p-6 md:p-8 flex flex-col">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-emerald-deep">توزيع الحالات</h2>
                        <p className="text-sm text-text-muted mt-1">نسبة قبول ورفض التسميع</p>
                    </div>

                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={5}
                                    stroke="none"
                                >
                                    {pieData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* النص في المنتصف */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-emerald-deep font-tajawal">{totalRecords}</span>
                            <span className="text-xs text-text-muted">سجل</span>
                        </div>
                    </div>

                    {/* مفتاح الرسم (Legend) المخصص */}
                    <div className="mt-4 space-y-3">
                        {pieData.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-emerald-deep">{item.name}</span>
                                </div>
                                <span className="font-bold" style={{ color: item.color }}>
                                    {Math.round((item.value / (totalRecords || 1)) * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. مخطط المقارنة (Bar Chart) - عرض كامل */}
            <div className="bg-surface rounded-3xl shadow-soft border border-border p-6 md:p-8">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-emerald-deep">تحليل تفصيلي يومي</h2>
                    <p className="text-sm text-text-muted mt-1">مقارنة الكميات المنجزة يومياً</p>
                </div>

                <div className="h-[300px] w-full dir-ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyActivity} barSize={20} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={formatDate}
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
                </div>
            </div>

        </div>
    );
}