"use client";

import { motion } from "framer-motion";
import { Message } from "@/lib/hooks/useMessages";
import { useAuth } from "@/lib/auth/hooks";

interface MessageBubbleProps {
    message: Message;
    showTime?: boolean;
}

export function MessageBubble({ message, showTime = true }: MessageBubbleProps) {
    const { user } = useAuth();
    const isMine = message.senderId === user?.uid;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: isMine ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`flex ${isMine ? "justify-start" : "justify-end"}`}
        >
            <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${isMine
                        ? "bg-emerald text-white rounded-br-md"
                        : "bg-surface border border-border text-text rounded-bl-md"
                    }`}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                </p>
                {showTime && (
                    <p className={`text-[10px] mt-1 ${isMine ? "text-white/70" : "text-text-muted"}`}>
                        {formatTime(message.createdAt)}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// Date separator
export function DateSeparator({ date }: { date: Date }) {
    const formatDate = (d: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return "اليوم";
        if (d.toDateString() === yesterday.toDateString()) return "أمس";
        return d.toLocaleDateString("ar-SA", { month: "long", day: "numeric" });
    };

    return (
        <div className="flex items-center justify-center my-4">
            <div className="px-3 py-1 bg-sand rounded-full text-xs text-text-muted">
                {formatDate(date)}
            </div>
        </div>
    );
}

// Message skeleton
export function MessageSkeleton({ isMine = false }: { isMine?: boolean }) {
    return (
        <div className={`flex ${isMine ? "justify-start" : "justify-end"}`}>
            <div
                className={`px-4 py-3 rounded-2xl animate-pulse ${isMine ? "bg-emerald/20 rounded-br-md" : "bg-sand rounded-bl-md"
                    }`}
            >
                <div className="h-4 w-40 bg-sand/50 rounded" />
            </div>
        </div>
    );
}
