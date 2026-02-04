"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Trophy, Medal, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { StudentBadge } from "@/components/ui/StudentBadge";

interface LeaderboardUser {
    id: string;
    name: string;
    photoURL?: string;
    totalPoints: number;
    equippedFrame?: string;
    equippedBadge?: string;
    equippedAvatar?: string;
}

export function Leaderboard() {
    const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db) return;

        // Fetch top 5 students by totalPoints
        const q = query(
            collection(db, "users"),
            orderBy("totalPoints", "desc"),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => {
                const userData = doc.data();
                return {
                    id: doc.id,
                    name: userData.name || "طالب",
                    photoURL: userData.photoURL,
                    totalPoints: userData.totalPoints || 0,
                    equippedFrame: userData.equippedFrame,
                    equippedBadge: userData.equippedBadge,
                    equippedAvatar: userData.equippedAvatar,
                };
            });
            // Filtering out students with 0 points might be cleaner, but keeping raw data logic for now
            const activeLeaders = data.filter(u => u.totalPoints > 0);
            setLeaders(activeLeaders);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getRankStyle = (index: number) => {
        switch (index) {
            case 0:
                return "bg-gold/10 border-gold/30 text-gold-dark"; // Gold
            case 1:
                return "bg-gray-100 border-gray-300 text-gray-600"; // Silver
            case 2:
                return "bg-orange-100 border-orange-300 text-orange-700"; // Bronze
            default:
                return "bg-white border-border text-text-primary";
        }
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Crown size={20} className="text-gold" strokeWidth={2.5} />;
            case 1:
                return <Medal size={20} className="text-gray-500" />;
            case 2:
                return <Medal size={20} className="text-orange-600" />;
            default:
                return <span className="text-sm font-bold text-text-muted w-5 text-center">{index + 1}</span>;
        }
    };

    if (isLoading) {
        return <LeaderboardSkeleton />;
    }

    if (leaders.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-border p-6 text-center">
                <Trophy className="mx-auto text-text-muted mb-2" size={32} />
                <p className="text-text-muted text-sm">لا توجد نقاط مسجلة بعد</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-gray-50/50 flex items-center gap-2">
                <Trophy size={18} className="text-gold" />
                <h3 className="font-bold text-text-primary">فرسان الحلقة</h3>
            </div>

            <div className="p-2 space-y-2">
                {leaders.map((leader, index) => (
                    <div
                        key={leader.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${getRankStyle(index)}`}
                    >
                        {/* Rank Icon */}
                        <div className="flex-shrink-0">
                            {getRankIcon(index)}
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                                <StudentAvatar
                                    student={{
                                        name: leader.name,
                                        photoURL: leader.photoURL,
                                        equippedFrame: leader.equippedFrame,
                                        equippedBadge: leader.equippedBadge,
                                        equippedAvatar: leader.equippedAvatar,
                                    }}
                                    size="md"
                                />
                            </div>
                            <div className="truncate flex items-center gap-1">
                                <p className="text-sm font-bold truncate">{leader.name}</p>
                                <StudentBadge badgeId={leader.equippedBadge} size="sm" />
                            </div>
                        </div>

                        {/* Points */}
                        <div className="flex-shrink-0 text-right">
                            <span className="text-xs font-bold opacity-80">{leader.totalPoints} نقطة</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LeaderboardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-gray-50/50 flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="w-24 h-4 rounded" />
            </div>
            <div className="p-2 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Skeleton className="w-5 h-5 rounded" />
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="w-20 h-4 rounded" />
                        </div>
                        <Skeleton className="w-10 h-4 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
