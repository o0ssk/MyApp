"use client";

import { useState, useEffect, useMemo } from "react";
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    getDoc,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// Types
export interface DailyActivity {
    date: string; // YYYY-MM-DD
    memorized: number;
    revised: number;
}

export interface StudentStats {
    id: string;
    name: string;
    avatar?: string;
    totalPages: number;
    logsCount: number;
}

export interface CircleStats {
    totalPagesMemorized: number;
    totalPagesRevised: number;
    activeStudents: number;
    pendingApprovals: number;
    completedTasks: number;
    totalTasks: number;
    completionRate: number;
    statusBreakdown: {
        approved: number;
        rejected: number;
        pending: number;
    };
    dailyActivity: DailyActivity[];
    topPerformers: StudentStats[];
    allStudentStats: StudentStats[];
}

// Helper to parse date
function parseDate(value: any): Date {
    if (!value) return new Date();
    if (value.toDate && typeof value.toDate === "function") {
        return value.toDate();
    }
    if (typeof value === "string") {
        return new Date(value);
    }
    if (value instanceof Date) {
        return value;
    }
    return new Date();
}

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

// Get start of month
function getMonthStart(year: number, month: number): Date {
    return new Date(year, month, 1);
}

// Get end of month
function getMonthEnd(year: number, month: number): Date {
    return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

// Get last N days
function getLastNDays(n: number): string[] {
    const dates: string[] = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(formatDate(date));
    }
    return dates;
}

// Hook: Fetch circle stats for a specific month
export function useCircleStats(circleIds: string[], year?: number, month?: number) {
    const [stats, setStats] = useState<CircleStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Default to current month
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth();

    useEffect(() => {
        if (circleIds.length === 0) {
            setStats(null);
            setIsLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                setIsLoading(true);

                const monthStart = getMonthStart(targetYear, targetMonth);
                const monthEnd = getMonthEnd(targetYear, targetMonth);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);

                // Initialize stats
                let totalPagesMemorized = 0;
                let totalPagesRevised = 0;
                let pendingApprovals = 0;
                let approvedLogs = 0;
                let rejectedLogs = 0;
                let pendingLogs = 0;
                let completedTasks = 0;
                let totalTasks = 0;

                const dailyMap: Record<string, { memorized: number; revised: number }> = {};
                const studentPageMap: Record<string, { pages: number; name: string; avatar?: string; logsCount: number }> = {};
                const activeStudentIds = new Set<string>();

                // Initialize last 7 days
                const last7Days = getLastNDays(7);
                last7Days.forEach((d) => {
                    dailyMap[d] = { memorized: 0, revised: 0 };
                });

                // Fetch logs for each circle
                for (const circleId of circleIds.slice(0, 10)) {
                    try {
                        const logsRef = collection(db, "logs");
                        const logsQuery = query(
                            logsRef,
                            where("circleId", "==", circleId),
                            orderBy("createdAt", "desc")
                        );

                        const logsSnap = await getDocs(logsQuery);

                        for (const logDoc of logsSnap.docs) {
                            const data = logDoc.data();
                            const createdAt = parseDate(data.createdAt);
                            const dateStr = formatDate(createdAt);
                            const pages = data.amount?.pages || 0;

                            // Count status
                            if (data.status === "pending_approval") {
                                pendingApprovals++;
                                pendingLogs++;
                            } else if (data.status === "approved") {
                                approvedLogs++;
                            } else if (data.status === "rejected") {
                                rejectedLogs++;
                            }

                            // Only count this month's data for totals
                            if (createdAt >= monthStart && createdAt <= monthEnd) {
                                if (data.type === "memorization") {
                                    totalPagesMemorized += pages;
                                } else {
                                    totalPagesRevised += pages;
                                }

                                // Track student stats
                                if (!studentPageMap[data.studentId]) {
                                    studentPageMap[data.studentId] = { pages: 0, name: "", logsCount: 0 };
                                }
                                if (data.status === "approved") {
                                    studentPageMap[data.studentId].pages += pages;
                                }
                                studentPageMap[data.studentId].logsCount++;
                            }

                            // Track daily activity for last 7 days
                            if (dailyMap[dateStr] && data.status === "approved") {
                                if (data.type === "memorization") {
                                    dailyMap[dateStr].memorized += pages;
                                } else {
                                    dailyMap[dateStr].revised += pages;
                                }
                            }

                            // Track active students (submitted this week)
                            if (createdAt >= weekAgo) {
                                activeStudentIds.add(data.studentId);
                            }
                        }
                    } catch (e: any) {
                        // Log the error but continue - might be missing index
                        console.error("Error fetching logs for circle:", circleId, e.message);
                        if (e.message?.includes("index")) {
                            console.log("Missing Firestore index. Create it at:", e.message.match(/https:\/\/[^\s]+/)?.[0]);
                        }
                    }
                }

                // Fetch tasks for each circle
                for (const circleId of circleIds.slice(0, 10)) {
                    try {
                        const tasksRef = collection(db, "tasks");
                        const tasksQuery = query(
                            tasksRef,
                            where("circleId", "==", circleId)
                        );

                        const tasksSnap = await getDocs(tasksQuery);
                        tasksSnap.forEach((taskDoc) => {
                            const data = taskDoc.data();
                            totalTasks++;
                            if (data.status === "completed" || data.status === "submitted") {
                                completedTasks++;
                            }
                        });
                    } catch (e) {
                        console.error("Error fetching tasks:", e);
                    }
                }

                // Fetch user names for top performers
                const studentIds = Object.keys(studentPageMap);
                for (const studentId of studentIds) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", studentId));
                        if (userDoc.exists()) {
                            studentPageMap[studentId].name = userDoc.data().name || "طالب";
                            studentPageMap[studentId].avatar = userDoc.data().photoURL;
                        }
                    } catch (e) {
                        console.error("Error fetching user:", e);
                    }
                }

                // Build daily activity array
                const dailyActivity: DailyActivity[] = last7Days.map((date) => ({
                    date,
                    memorized: dailyMap[date]?.memorized || 0,
                    revised: dailyMap[date]?.revised || 0,
                }));

                // Build student stats and sort by pages
                const allStudentStats: StudentStats[] = Object.entries(studentPageMap)
                    .map(([id, data]) => ({
                        id,
                        name: data.name || "طالب",
                        avatar: data.avatar,
                        totalPages: data.pages,
                        logsCount: data.logsCount,
                    }))
                    .sort((a, b) => b.totalPages - a.totalPages);

                const topPerformers = allStudentStats.slice(0, 3);

                // Calculate completion rate
                const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                setStats({
                    totalPagesMemorized,
                    totalPagesRevised,
                    activeStudents: activeStudentIds.size,
                    pendingApprovals,
                    completedTasks,
                    totalTasks,
                    completionRate,
                    statusBreakdown: {
                        approved: approvedLogs,
                        rejected: rejectedLogs,
                        pending: pendingLogs,
                    },
                    dailyActivity,
                    topPerformers,
                    allStudentStats,
                });
                setError(null);
            } catch (err: any) {
                console.error("Fetch stats error:", err);
                setError("فشل في تحميل الإحصائيات");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [circleIds.join(","), targetYear, targetMonth]);

    return { stats, isLoading, error };
}

// Export to CSV
export function exportToCSV(data: StudentStats[], monthLabel: string): void {
    const headers = ["الترتيب", "اسم الطالب", "الصفحات المعتمدة", "عدد السجلات"];
    const rows = data.map((student, index) => [
        index + 1,
        student.name,
        student.totalPages,
        student.logsCount,
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Add BOM for Arabic support in Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_${monthLabel}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
