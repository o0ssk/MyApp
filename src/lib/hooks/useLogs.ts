"use client";

import { useState, useEffect, useCallback } from "react";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    QueryDocumentSnapshot,
    DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/hooks";

export interface Log {
    id: string;
    circleId: string;
    studentId: string;
    date: string;
    type: "memorization" | "revision";
    amount: {
        pages?: number;
        surah?: string;
        ayahFrom?: number;
        ayahTo?: number;
    };
    status: "pending_approval" | "approved" | "rejected";
    studentNotes?: string;
    teacherNotes?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface LogFilters {
    type?: "memorization" | "revision" | null;
    status?: "pending_approval" | "approved" | "rejected" | null;
    month?: string; // YYYY-MM format
    search?: string;
}

export interface LogStats {
    totalPagesThisMonth: number;
    totalPagesThisWeek: number;
    memorizationPages: number;
    revisionPages: number;
    weeklyData: { date: string; pages: number }[];
    typeBreakdown: { memorization: number; revision: number };
    // Chart-specific data
    monthlyChartData: { day: number; memorized: number; revised: number }[];
    weeklyChartData: { day: string; memorized: number; revised: number }[];
}

const PAGE_SIZE = 10;

function getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getStartOfWeek(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
}

function getLast7Days(): string[] {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split("T")[0]);
    }
    return days;
}

function getLast30Days(): { date: string; day: number }[] {
    const days: { date: string; day: number }[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({ date: d.toISOString().split("T")[0], day: d.getDate() });
    }
    return days;
}

// Arabic day names
const ARABIC_DAYS: Record<number, string> = {
    0: "الأحد",
    1: "الإثنين",
    2: "الثلاثاء",
    3: "الأربعاء",
    4: "الخميس",
    5: "الجمعة",
    6: "السبت",
};

function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

export function useLogsWithFilters(circleId: string | null) {
    const { user } = useAuth();
    const [logs, setLogs] = useState<Log[]>([]);
    const [allLogs, setAllLogs] = useState<Log[]>([]); // For stats calculation
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<LogFilters>({});
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Build query with filters
    const buildQuery = useCallback((afterDoc?: QueryDocumentSnapshot<DocumentData> | null) => {
        if (!user || !circleId) return null;

        const logsRef = collection(db, "logs");
        const constraints: any[] = [
            where("studentId", "==", user.uid),
            where("circleId", "==", circleId),
            orderBy("createdAt", "desc"),
            limit(PAGE_SIZE),
        ];

        if (filters.type) {
            constraints.splice(2, 0, where("type", "==", filters.type));
        }

        if (filters.status) {
            constraints.splice(2, 0, where("status", "==", filters.status));
        }

        if (afterDoc) {
            constraints.push(startAfter(afterDoc));
        }

        return query(logsRef, ...constraints);
    }, [user, circleId, filters]);

    // Fetch logs
    const fetchLogs = useCallback(async (reset = true) => {
        if (!user || !circleId) {
            setLogs([]);
            setIsLoading(false);
            return;
        }

        if (reset) {
            setIsLoading(true);
            setLastDoc(null);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const q = buildQuery(reset ? null : lastDoc);
            if (!q) return;

            const snapshot = await getDocs(q);
            const logsData: Log[] = snapshot.docs.map((d) => ({
                id: d.id,
                circleId: d.data().circleId,
                studentId: d.data().studentId,
                date: d.data().date,
                type: d.data().type,
                amount: d.data().amount || {},
                status: d.data().status,
                studentNotes: d.data().studentNotes,
                teacherNotes: d.data().teacherNotes,
                createdAt: d.data().createdAt?.toDate() || new Date(),
                updatedAt: d.data().updatedAt?.toDate(),
            }));

            // Apply client-side search filter (Firestore doesn't support text search)
            let filteredLogs = logsData;
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredLogs = logsData.filter((log) => {
                    const pagesMatch = log.amount.pages?.toString().includes(searchLower);
                    const surahMatch = log.amount.surah?.toLowerCase().includes(searchLower);
                    const notesMatch = log.studentNotes?.toLowerCase().includes(searchLower);
                    return pagesMatch || surahMatch || notesMatch;
                });
            }

            // Apply month filter client-side
            if (filters.month) {
                filteredLogs = filteredLogs.filter((log) => log.date.startsWith(filters.month!));
            }

            if (reset) {
                setLogs(filteredLogs);
            } else {
                setLogs((prev) => [...prev, ...filteredLogs]);
            }

            setHasMore(snapshot.docs.length === PAGE_SIZE);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
            setError(null);
        } catch (err: any) {
            console.error("Fetch logs error:", err);
            setError("فشل في تحميل السجلات");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [user, circleId, buildQuery, lastDoc, filters]);

    // Fetch all logs for stats (without pagination)
    const fetchAllLogsForStats = useCallback(async () => {
        if (!user || !circleId) return;

        try {
            const logsRef = collection(db, "logs");
            const q = query(
                logsRef,
                where("studentId", "==", user.uid),
                where("circleId", "==", circleId),
                orderBy("createdAt", "desc"),
                limit(100)
            );

            const snapshot = await getDocs(q);
            const logsData: Log[] = snapshot.docs.map((d) => ({
                id: d.id,
                circleId: d.data().circleId,
                studentId: d.data().studentId,
                date: d.data().date,
                type: d.data().type,
                amount: d.data().amount || {},
                status: d.data().status,
                studentNotes: d.data().studentNotes,
                teacherNotes: d.data().teacherNotes,
                createdAt: d.data().createdAt?.toDate() || new Date(),
                updatedAt: d.data().updatedAt?.toDate(),
            }));

            setAllLogs(logsData);
        } catch (err) {
            console.error("Fetch all logs error:", err);
        }
    }, [user, circleId]);

    // Initial fetch
    useEffect(() => {
        fetchLogs(true);
        fetchAllLogsForStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, circleId, filters.type, filters.status]);

    // Re-fetch when search/month changes (debounced effect)
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchLogs(true);
        }, 300);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.search, filters.month]);

    // Calculate stats from allLogs
    const stats: LogStats = (() => {
        const startOfMonth = getStartOfMonth();
        const startOfWeek = getStartOfWeek();
        const last7Days = getLast7Days();
        const last30Days = getLast30Days();

        let monthlyPages = 0;
        let weeklyPages = 0;
        let memPages = 0;
        let revPages = 0;
        const dailyMap: Record<string, number> = {};
        last7Days.forEach((d) => (dailyMap[d] = 0));

        // Chart data maps
        const monthlyMemMap: Record<string, number> = {};
        const monthlyRevMap: Record<string, number> = {};
        last30Days.forEach((d) => {
            monthlyMemMap[d.date] = 0;
            monthlyRevMap[d.date] = 0;
        });

        const weeklyMemMap: Record<string, number> = {};
        const weeklyRevMap: Record<string, number> = {};
        last7Days.forEach((d) => {
            weeklyMemMap[d] = 0;
            weeklyRevMap[d] = 0;
        });

        allLogs.forEach((log) => {
            if (log.status !== "approved") return;
            const pages = log.amount.pages || 0;
            const logDate = new Date(log.date);

            if (logDate >= startOfMonth) monthlyPages += pages;
            if (logDate >= startOfWeek) weeklyPages += pages;
            if (log.type === "memorization") memPages += pages;
            else revPages += pages;

            if (dailyMap[log.date] !== undefined) {
                dailyMap[log.date] += pages;
            }

            // Monthly chart data
            if (monthlyMemMap[log.date] !== undefined) {
                if (log.type === "memorization") {
                    monthlyMemMap[log.date] += pages;
                } else {
                    monthlyRevMap[log.date] += pages;
                }
            }

            // Weekly chart data
            if (weeklyMemMap[log.date] !== undefined) {
                if (log.type === "memorization") {
                    weeklyMemMap[log.date] += pages;
                } else {
                    weeklyRevMap[log.date] += pages;
                }
            }
        });

        // Build monthly chart data
        const monthlyChartData = last30Days.map((d) => ({
            day: d.day,
            memorized: monthlyMemMap[d.date] || 0,
            revised: monthlyRevMap[d.date] || 0,
        }));

        // Build weekly chart data with Arabic day names
        const weeklyChartData = last7Days.map((dateStr) => {
            const date = new Date(dateStr);
            const dayName = ARABIC_DAYS[date.getDay()] || dateStr;
            return {
                day: dayName,
                memorized: weeklyMemMap[dateStr] || 0,
                revised: weeklyRevMap[dateStr] || 0,
            };
        });

        return {
            totalPagesThisMonth: monthlyPages,
            totalPagesThisWeek: weeklyPages,
            memorizationPages: memPages,
            revisionPages: revPages,
            weeklyData: last7Days.map((d) => ({ date: d, pages: dailyMap[d] || 0 })),
            typeBreakdown: { memorization: memPages, revision: revPages },
            monthlyChartData,
            weeklyChartData,
        };
    })();

    // Add log
    const addLog = async (data: {
        type: "memorization" | "revision";
        amount: Log["amount"];
        studentNotes?: string;
    }): Promise<{ success: boolean; error?: string }> => {
        if (!user || !circleId) return { success: false, error: "بيانات غير كافية" };

        try {
            await addDoc(collection(db, "logs"), {
                circleId,
                studentId: user.uid,
                date: getToday(),
                type: data.type,
                amount: data.amount,
                status: "pending_approval",
                studentNotes: data.studentNotes || null,
                teacherNotes: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            await fetchLogs(true);
            await fetchAllLogsForStats();
            return { success: true };
        } catch (err: any) {
            console.error("Add log error:", err);
            return { success: false, error: "فشل في إضافة السجل" };
        }
    };

    // Update student notes only
    const updateStudentNotes = async (logId: string, notes: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, "logs", logId), {
                studentNotes: notes,
                updatedAt: serverTimestamp(),
            });

            setLogs((prev) =>
                prev.map((log) =>
                    log.id === logId ? { ...log, studentNotes: notes, updatedAt: new Date() } : log
                )
            );

            return { success: true };
        } catch (err: any) {
            console.error("Update notes error:", err);
            return { success: false, error: "فشل في تحديث الملاحظات" };
        }
    };

    // Load more
    const loadMore = () => {
        if (hasMore && !isLoadingMore) {
            fetchLogs(false);
        }
    };

    // Update filters
    const updateFilters = (newFilters: Partial<LogFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({});
    };

    // Refetch
    const refetch = () => {
        fetchLogs(true);
        fetchAllLogsForStats();
    };

    return {
        logs,
        allLogs,
        stats,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        filters,
        updateFilters,
        clearFilters,
        addLog,
        updateStudentNotes,
        loadMore,
        refetch,
    };
}

// Re-export simple hook for dashboard compatibility
export function useLogs(circleId: string | null) {
    const hook = useLogsWithFilters(circleId);
    return {
        logs: hook.logs,
        recentLogs: hook.logs.slice(0, 8),
        stats: hook.stats,
        isLoading: hook.isLoading,
        error: hook.error,
        addLog: hook.addLog,
    };
}
