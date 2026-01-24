"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Loader2, PieChart as PieIcon } from "lucide-react";
import { formatDateKey } from "@/lib/hooks/useAttendance";

const COLORS = {
    present: "#0F3D2E",
    late: "#C7A14A",
    absent: "#DC2626",
    excused: "#3B82F6",
};

const LABELS: Record<string, string> = {
    present: "حضور",
    late: "تأخر",
    absent: "غياب",
    excused: "بعذر",
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-surface/90 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-elevated min-w-[150px]">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.color }} />
                    <p className="font-bold text-emerald-deep font-tajawal">{data.label}</p>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-tajawal" style={{ color: data.color }}>{data.value}</span>
                    <span className="text-xs text-text-muted">طالب</span>
                </div>
            </div>
        );
    }
    return null;
};

export function AttendanceAnalytics({ circleId, date }: { circleId: string, date: Date }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        async function fetchStats() {
            if (!circleId) return;

            setLoading(true);
            try {
                // تنسيق التاريخ لنفس الصيغة المحفوظة في قاعدة البيانات
                const dateString = formatDateKey(date);

                const q = query(
                    collection(db, "attendance"),
                    where("circleId", "==", circleId),
                    where("date", "==", dateString)
                );

                const snapshot = await getDocs(q);

                const counts = { present: 0, late: 0, absent: 0, excused: 0 };
                let totalRecords = 0;

                snapshot.docs.forEach((doc) => {
                    const status = doc.data().status as keyof typeof counts;
                    if (counts[status] !== undefined) {
                        counts[status]++;
                        totalRecords++;
                    }
                });

                const chartData = Object.entries(counts).map(([name, value]) => ({
                    name,
                    value,
                    label: LABELS[name],
                    color: COLORS[name as keyof typeof COLORS],
                }));

                setData(chartData);
                setTotal(totalRecords);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [circleId, date]);

    if (loading) {
        return (
            <div className="h-64 w-full flex flex-col items-center justify-center gap-4 bg-surface/50 rounded-2xl border border-dashed border-border">
                <Loader2 className="w-8 h-8 animate-spin text-emerald/20" />
            </div>
        );
    }

    if (total === 0) {
        return (
            <div className="h-64 w-full flex flex-col items-center justify-center text-center p-8 bg-surface/50 rounded-2xl border border-dashed border-border">
                <div className="w-16 h-16 bg-emerald/5 rounded-full flex items-center justify-center mb-4">
                    <PieIcon className="w-8 h-8 text-emerald/20" />
                </div>
                <p className="text-emerald-deep font-medium">لا يوجد تحضير لهذا اليوم</p>
                <p className="text-text-muted text-sm mt-1">سجل الحضور في الجدول بالأسفل لتظهر الإحصائيات</p>
            </div>
        );
    }

    const activeData = data.filter(d => d.value > 0);

    return (
        <div className="bg-surface rounded-3xl shadow-soft border border-border p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-emerald-deep">إحصائيات اليوم</h2>
                <span className="text-xs bg-emerald/10 text-emerald px-3 py-1 rounded-full font-bold">
                    {formatDateKey(date)}
                </span>
            </div>

            <div className="grid md:grid-cols-12 gap-8 items-center">
                {/* CHART SECTION */}
                <div className="md:col-span-5 h-64 relative group">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={activeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                                cornerRadius={6}
                                stroke="none"
                            >
                                {activeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} cursor={false} />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-5xl font-bold text-emerald-deep font-tajawal tracking-tight">{total}</span>
                        <span className="text-sm text-text-muted font-medium mt-1">طالب</span>
                    </div>
                </div>

                {/* DETAILS LIST */}
                <div className="md:col-span-7 space-y-5">
                    {data.map((item) => {
                        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                        return (
                            <div key={item.name} className="group">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="font-medium text-emerald-deep text-base">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-text-muted bg-sand px-2 py-1 rounded-md border border-border/50">
                                            {item.value}
                                        </span>
                                        <span className="font-bold text-sm min-w-[3ch] text-left" style={{ color: item.color }}>
                                            {percentage}%
                                        </span>
                                    </div>
                                </div>
                                <div className="h-2.5 w-full bg-sand rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: item.color,
                                            opacity: item.value > 0 ? 1 : 0.3
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
