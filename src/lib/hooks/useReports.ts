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
    onSnapshot,
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
    equippedFrame?: string;
    equippedBadge?: string;
    equippedAvatar?: string;
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

// Hook: Fetch circle stats for a specific month (Real-time)
export function useCircleStats(circleIds: string[], year?: number, month?: number) {
    // 1. Core State
    const [stats, setStats] = useState<CircleStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 2. Data State
    const [logsData, setLogsData] = useState<any[]>([]);
    const [tasksData, setTasksData] = useState<any[]>([]);
    const [activeMemberIds, setActiveMemberIds] = useState<Set<string>>(new Set());

    // Updated cache type to include equipped items
    const [usersCache, setUsersCache] = useState<Record<string, {
        name: string;
        avatar?: string;
        equippedFrame?: string;
        equippedBadge?: string;
        equippedAvatar?: string;
    }>>({});

    // 3. Calculation Vars
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth();

    // Stable circle IDs dependency
    const circleIdsKey = circleIds.slice(0, 10).join(',');

    // 4. Effects
    // Listen to Data (Logs, Tasks, & Members)
    useEffect(() => {
        if (!circleIdsKey) {
            setStats(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const targetIds = circleIdsKey.split(',');

        // Queries
        const logsQ = query(
            collection(db, "logs"),
            where("circleId", "in", targetIds),
            orderBy("createdAt", "desc")
        );

        const tasksQ = query(
            collection(db, "tasks"),
            where("circleId", "in", targetIds)
        );

        const membersQ = query(
            collection(db, "circleMembers"),
            where("circleId", "in", targetIds),
            where("status", "==", "approved")
        );

        // Subscriptions
        const unsubLogs = onSnapshot(logsQ, (snap) => {
            setLogsData(snap.docs.map(d => d.data()));
        }, (err) => {
            console.error("Logs error:", err);
            // Fallback for missing index
            if (err.message.includes("index")) {
                const fallbackQ = query(collection(db, "logs"), where("circleId", "in", targetIds));
                onSnapshot(fallbackQ, s => setLogsData(s.docs.map(d => d.data())));
            }
        });

        const unsubTasks = onSnapshot(tasksQ, (snap) => {
            setTasksData(snap.docs.map(d => d.data()));
        });

        const unsubMembers = onSnapshot(membersQ, (snap) => {
            const activeIds = new Set(snap.docs.map(d => d.data().userId));
            setActiveMemberIds(activeIds);
        }, (err) => {
            console.error("Members error:", err);
        });

        return () => {
            unsubLogs();
            unsubTasks();
            unsubMembers();
        };
    }, [circleIdsKey]);

    // Fetch Users Side-Effect
    useEffect(() => {
        if (logsData.length === 0) return;

        // Only fetch users who are active OR have logs (though we might filter logs later, we need names)
        const uniqueStudentIds = Array.from(new Set(logsData.map((l: any) => l.studentId)));

        // Identify missing IDs purely based on current cache state
        const missingIds = uniqueStudentIds.filter(id => id && !usersCache[id]);

        if (missingIds.length === 0) return;

        let active = true;
        const fetchMissing = async () => {
            const newUsers: Record<string, {
                name: string;
                avatar?: string;
                equippedFrame?: string;
                equippedBadge?: string;
                equippedAvatar?: string;
            }> = {};
            let found = false;

            for (const uid of missingIds) {
                try {
                    const snap = await getDoc(doc(db, "users", uid));
                    if (snap.exists()) {
                        const d = snap.data();
                        newUsers[uid] = {
                            name: d.name || "طالب",
                            avatar: d.photoURL,
                            equippedFrame: d.equippedFrame,
                            equippedBadge: d.equippedBadge,
                            equippedAvatar: d.equippedAvatar
                        };
                        found = true;
                    }
                } catch (e) { console.error(e); }
            }

            if (active && found) {
                setUsersCache(prev => ({ ...prev, ...newUsers }));
            }
        };

        fetchMissing();
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logsData.length]);

    // Calculate Stats
    useEffect(() => {
        if (!circleIdsKey) return;

        const monthStart = getMonthStart(targetYear, targetMonth);
        const monthEnd = getMonthEnd(targetYear, targetMonth);

        let totalPagesMemorized = 0;
        let totalPagesRevised = 0;
        let pendingApprovals = 0;
        let approvedLogs = 0;
        let rejectedLogs = 0;
        let pendingLogs = 0;
        let completedTasks = 0;
        let totalTasks = 0;

        const dailyMap: Record<string, { memorized: number; revised: number }> = {};
        const studentPageMap: Record<string, {
            pages: number;
            name: string;
            avatar?: string;
            equippedFrame?: string;
            equippedBadge?: string;
            equippedAvatar?: string;
            logsCount: number
        }> = {};

        const last7Days = getLastNDays(7);
        last7Days.forEach((d) => dailyMap[d] = { memorized: 0, revised: 0 });

        // Process Logs
        logsData.forEach((data) => {
            // STRICT FILTER: Only include data for currently active students
            if (!activeMemberIds.has(data.studentId)) return;

            const createdAt = parseDate(data.createdAt);
            const dateStr = formatDate(createdAt);
            const pages = data.amount?.pages || 0;

            if (data.status === "pending_approval") {
                pendingApprovals++;
                pendingLogs++;
            } else if (data.status === "approved") {
                approvedLogs++;
            } else if (data.status === "rejected") {
                rejectedLogs++;
            }

            if (createdAt >= monthStart && createdAt <= monthEnd) {
                // Charts & Totals: ONLY APPROVED
                if (data.status === "approved") {
                    if (data.type === "memorization") totalPagesMemorized += pages;
                    else totalPagesRevised += pages;
                }

                if (!studentPageMap[data.studentId]) {
                    const cached = usersCache[data.studentId];
                    studentPageMap[data.studentId] = {
                        pages: 0,
                        name: cached?.name || "طالب",
                        avatar: cached?.avatar,
                        equippedFrame: cached?.equippedFrame,
                        equippedBadge: cached?.equippedBadge,
                        equippedAvatar: cached?.equippedAvatar,
                        logsCount: 0
                    };
                } else if (usersCache[data.studentId]) {
                    studentPageMap[data.studentId].name = usersCache[data.studentId].name;
                    studentPageMap[data.studentId].avatar = usersCache[data.studentId].avatar;
                    studentPageMap[data.studentId].equippedFrame = usersCache[data.studentId].equippedFrame;
                    studentPageMap[data.studentId].equippedBadge = usersCache[data.studentId].equippedBadge;
                    studentPageMap[data.studentId].equippedAvatar = usersCache[data.studentId].equippedAvatar;
                }

                if (data.status === "approved") studentPageMap[data.studentId].pages += pages;

                studentPageMap[data.studentId].logsCount++;
            }

            if (dailyMap[dateStr] && data.status === "approved") {
                if (data.type === "memorization") dailyMap[dateStr].memorized += pages;
                else dailyMap[dateStr].revised += pages;
            }
        });

        // Process Tasks
        tasksData.forEach((data) => {
            // STRICT FILTER: Only include tasks for currently active students
            if (!activeMemberIds.has(data.studentId)) return;

            totalTasks++;
            if (data.status === "completed" || data.status === "submitted") completedTasks++;
        });

        const dailyActivity = last7Days.map((date) => ({
            date,
            memorized: dailyMap[date]?.memorized || 0,
            revised: dailyMap[date]?.revised || 0,
        }));

        const allStudentStats = Object.entries(studentPageMap)
            .map(([id, data]) => ({
                id,
                name: data.name,
                avatar: data.avatar,
                equippedFrame: data.equippedFrame,
                equippedBadge: data.equippedBadge,
                equippedAvatar: data.equippedAvatar,
                totalPages: data.pages,
                logsCount: data.logsCount,
            }))
            .sort((a, b) => b.totalPages - a.totalPages);

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        setStats({
            totalPagesMemorized,
            totalPagesRevised,
            activeStudents: activeMemberIds.size,
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
            topPerformers: allStudentStats.slice(0, 3),
            allStudentStats,
        });
        setIsLoading(false);

    }, [logsData, tasksData, usersCache, circleIdsKey, targetYear, targetMonth, activeMemberIds]);

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
