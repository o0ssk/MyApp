"use client";

import { motion } from "framer-motion";
import { Thread } from "@/lib/hooks/useMessages";
import { listItem } from "@/lib/motion";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { StudentBadge } from "@/components/ui/StudentBadge";

interface ThreadCardProps {
    thread: Thread;
    onClick: () => void;
}

export function ThreadCard({ thread, onClick }: ThreadCardProps) {
    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "الآن";
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;
        return date.toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
    };

    return (
        <motion.button
            variants={listItem}
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 bg-surface rounded-2xl border border-border hover:border-gold/30 hover:shadow-md transition-all text-right"
        >
            {/* Avatar */}
            <div className="relative">
                <StudentAvatar
                    student={{
                        name: thread.otherUserName || "مستخدم",
                        photoURL: thread.otherUserAvatar,
                        equippedFrame: thread.otherUserFrame,
                        equippedBadge: thread.otherUserBadge,
                    }}
                    size="md"
                />
                {/* Unread indicator */}
                {thread.isUnread && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border-2 border-surface" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`font-bold truncate flex items-center gap-1 ${thread.isUnread ? "text-emerald-deep" : "text-text"}`}>
                        {thread.otherUserName || "مستخدم"}
                        <StudentBadge badgeId={thread.otherUserBadge} size="sm" />
                    </span>
                    <span className="text-xs text-text-muted whitespace-nowrap">
                        {formatTime(thread.lastMessageAt)}
                    </span>
                </div>
                <p className={`text-sm truncate ${thread.isUnread ? "text-emerald font-medium" : "text-text-muted"}`}>
                    {thread.lastMessage || "ابدأ المحادثة..."}
                </p>
            </div>
        </motion.button>
    );
}

// Skeleton
export function ThreadCardSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-border animate-pulse">
            <div className="w-12 h-12 bg-sand rounded-full" />
            <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                    <div className="h-4 bg-sand rounded w-24" />
                    <div className="h-3 bg-sand rounded w-12" />
                </div>
                <div className="h-3 bg-sand rounded w-3/4" />
            </div>
        </div>
    );
}
