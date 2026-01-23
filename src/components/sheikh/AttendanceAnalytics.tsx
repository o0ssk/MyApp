"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Loader2 } from "lucide-react";

const COLORS = {
    present: "#0F3D2E", // Emerald
    late: "#C7A14A",    // Gold
    absent: "#EF4444",  // Red
    excused: "#3B82F6", // Blue
};

const LABELS: Record<string, string> = {
    present: "حاضر",
    late: "متأخر",
    absent: "غائب",
    excused: "بعذر",
};

export function AttendanceAnalytics({ circleId }: { circleId: string }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        async function fetchStats() {
            try {
                const q = query(collection(db, "attendance"), where("circleId", "==", circleId));
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
                })).filter(item => item.value > 0); // Hide zero values

                setData(chartData);
                setTotal(totalRecords);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }

        if (circleId) fetchStats();
    }, [circleId]);

    if (loading) return <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-emerald" /></div>;
    if (total === 0) return null; // Don't show if no data

    return (
        <div className="grid md:grid-cols-2 gap-8 items-center p-4">
            {/* Chart Section */}
            <div className="h-64 w-full relative">
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
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#0F3D2E', fontFamily: 'var(--font-tajawal)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-emerald-deep">{total}</span>
                    <span className="text-xs text-text-muted">سجل</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {data.map((item) => (
                    <div key={item.name} className="bg-sand/50 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium text-emerald-deep">{item.label}</span>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: item.color }}>
                            {Math.round((item.value / total) * 100)}%
                        </div>
                        <div className="text-xs text-text-muted">{item.value} طالب</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
