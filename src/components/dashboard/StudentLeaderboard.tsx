"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot, doc, getDoc, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Award, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { StudentBadge } from "@/components/ui/StudentBadge";
import { useAuth } from "@/lib/auth/hooks";

// Arabic month names
const ARABIC_MONTHS = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

// Helper: Get start of month
function getMonthStart(year: number, month: number): Date {
    return new Date(year, month, 1, 0, 0, 0, 0);
}

// Helper: Get end of month
function getMonthEnd(year: number, month: number): Date {
    return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

// Helper: Parse Firestore timestamp or date
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

interface StudentStats {
    id: string;
    name: string;
    avatar?: string;
    equippedFrame?: string;
    equippedBadge?: string;
    equippedAvatar?: string;
    totalPages: number;
}

interface StudentLeaderboardProps {
    circleId: string | null;
}

export function StudentLeaderboard({ circleId }: StudentLeaderboardProps) {
    const { userProfile } = useAuth();
    const [topPerformers, setTopPerformers] = useState<StudentStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ Current month boundaries
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthStart = getMonthStart(currentYear, currentMonth);
    const monthEnd = getMonthEnd(currentYear, currentMonth);
    const monthLabel = ARABIC_MONTHS[currentMonth];

    useEffect(() => {
        if (!db || !circleId) {
            setIsLoading(false);
            return;
        }

        console.log("📡 StudentLeaderboard: Fetching for circleId:", circleId);
        console.log("📅 Month filter:", monthLabel, currentYear);

        // ✅ EXACT SAME APPROACH AS SHEIKH'S useReports HOOK
        // Step 1: Query circleMembers to get active student IDs
        const membersQuery = query(
            collection(db, "circleMembers"),
            where("circleId", "==", circleId),
            where("status", "==", "approved")
        );

        // Step 2: Query approved logs to calculate pages
        const logsQuery = query(
            collection(db, "logs"),
            where("circleId", "==", circleId),
            where("status", "==", "approved")
        );

        let activeMemberIds: string[] = [];
        let logsData: any[] = [];
        let usersCache: Record<string, StudentStats> = {};

        const unsubMembers = onSnapshot(membersQuery, async (snapshot) => {
            activeMemberIds = snapshot.docs.map((d) => d.data().userId);
            console.log("👥 Active members:", activeMemberIds.length);
            calculateLeaderboard();
        });

        const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
            logsData = snapshot.docs.map((d) => d.data());
            console.log("📋 Logs found:", logsData.length);
            calculateLeaderboard();
        });

        async function calculateLeaderboard() {
            if (activeMemberIds.length === 0) {
                setTopPerformers([]);
                setIsLoading(false);
                return;
            }

            // ✅ Calculate pages per student from logs (CURRENT MONTH ONLY)
            const studentPageMap: Record<string, number> = {};

            logsData.forEach((log) => {
                if (!activeMemberIds.includes(log.studentId)) return;

                // Filter by current month
                const createdAt = parseDate(log.createdAt);
                if (createdAt < monthStart || createdAt > monthEnd) return;

                const pages = log.amount?.pages || 0;
                studentPageMap[log.studentId] = (studentPageMap[log.studentId] || 0) + pages;
            });

            console.log("📊 Monthly pages calculated for:", Object.keys(studentPageMap).length, "students");

            // Fetch user data for students with pages
            const results: StudentStats[] = [];

            for (const studentId of Object.keys(studentPageMap)) {
                if (!usersCache[studentId]) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", studentId));
                        if (userDoc.exists()) {
                            const d = userDoc.data();
                            usersCache[studentId] = {
                                id: studentId,
                                name: d.name || "طالب",
                                avatar: d.photoURL,
                                equippedFrame: d.equippedFrame,
                                equippedBadge: d.equippedBadge,
                                equippedAvatar: d.equippedAvatar,
                                totalPages: studentPageMap[studentId],
                            };
                        }
                    } catch (e) {
                        console.error("Error fetching user:", e);
                    }
                } else {
                    usersCache[studentId].totalPages = studentPageMap[studentId];
                }

                if (usersCache[studentId]) {
                    results.push(usersCache[studentId]);
                }
            }

            // Sort by totalPages descending, take top 5
            const sorted = results.sort((a, b) => b.totalPages - a.totalPages).slice(0, 5);
            console.log("✅ Top performers:", sorted.length);
            setTopPerformers(sorted);
            setIsLoading(false);
        }

        return () => {
            unsubMembers();
            unsubLogs();
        };
    }, [circleId]);

    if (isLoading) {
        return <StudentLeaderboardSkeleton />;
    }

    if (!circleId) {
        return null;
    }

    // ✅ EXACT SAME UI AS SHEIKH'S REPORTS PAGE (lines 276-348)
    return (
        <Card className="border-border shadow-soft bg-surface overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-sand/30">
                <CardTitle className="flex items-center gap-3 text-emerald-deep">
                    <div className="p-2 bg-gold/10 rounded-lg">
                        <Award size={24} className="text-gold" />
                    </div>
                    <div>
                        <span>فرسان الحلقة (الأكثر إنجازاً)</span>
                        <span className="flex items-center gap-1 text-xs text-text-muted font-normal mt-0.5">
                            <Calendar size={12} />
                            {monthLabel} {currentYear}
                        </span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {topPerformers.length === 0 ? (
                    <div className="text-center py-8 text-text-muted">
                        <p>لا توجد بيانات كافية لعرض الترتيب</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {topPerformers.map((student, index) => {
                            const isCurrentUser = student.id === userProfile?.uid;
                            return (
                                <div
                                    key={student.id}
                                    className={`flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:border-emerald/30 hover:shadow-md transition-all ${isCurrentUser ? "ring-2 ring-emerald-500 bg-emerald-50/30" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${index === 0
                                                ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                                : index === 1
                                                    ? "bg-gradient-to-br from-gray-300 to-gray-500"
                                                    : index === 2
                                                        ? "bg-gradient-to-br from-amber-600 to-amber-800"
                                                        : "bg-zinc-300"
                                                }`}
                                        >
                                            {index + 1}
                                        </div>

                                        {/* Avatar & Name */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                                                <StudentAvatar
                                                    student={{
                                                        name: student.name,
                                                        photoURL: student.avatar,
                                                        equippedFrame: student.equippedFrame,
                                                        equippedBadge: student.equippedBadge,
                                                        equippedAvatar: student.equippedAvatar,
                                                    }}
                                                    size="md"
                                                    className="w-full h-full"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-emerald-deep text-sm md:text-base whitespace-nowrap truncate flex items-center gap-1">
                                                    <span className="truncate">{student.name}</span>
                                                    {isCurrentUser && (
                                                        <span className="text-emerald-500 text-xs flex-shrink-0">(أنت)</span>
                                                    )}
                                                    <StudentBadge badgeId={student.equippedBadge} size="sm" />
                                                </h4>
                                                <p className="text-[10px] md:text-xs text-text-muted whitespace-nowrap truncate">المستوى المتقدم</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score - This Month */}
                                    <div className="text-center bg-sand/50 px-4 py-2 rounded-lg">
                                        <p className="text-xl font-bold text-emerald-deep">{student.totalPages}</p>
                                        <p className="text-[10px] text-text-muted font-bold">صفحة</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function StudentLeaderboardSkeleton() {
    return (
        <Card className="border-border shadow-soft bg-surface overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-sand/30">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <Skeleton className="w-48 h-6 rounded" />
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-xl">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-10 h-10 rounded-xl" />
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="w-24 h-4 rounded" />
                                    <Skeleton className="w-16 h-3 rounded" />
                                </div>
                            </div>
                            <Skeleton className="w-16 h-12 rounded-lg" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
