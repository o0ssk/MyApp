"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, User, Loader2 } from "lucide-react";

import { useThreadMessages } from "@/lib/hooks/useMessages";
import { useAuth } from "@/lib/auth/hooks";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageBubble, DateSeparator, MessageSkeleton } from "@/components/messages/MessageBubble";
import { Composer } from "@/components/messages/Composer";
import { fadeUp } from "@/lib/motion";

export default function SheikhThreadPage() {
    const params = useParams();
    const router = useRouter();
    const threadId = params.threadId as string;
    const { user } = useAuth();

    const { messages, threadInfo, isLoading, error, sendMessage, markAsRead } = useThreadMessages(threadId);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasMarkedRead = useRef(false);

    // Mark as read on mount
    useEffect(() => {
        if (threadId && !hasMarkedRead.current) {
            hasMarkedRead.current = true;
            markAsRead();
        }
    }, [threadId, markAsRead]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages.length]);

    // Group messages by date for separators
    const groupedMessages = messages.reduce<{ date: string; messages: typeof messages }[]>((acc, msg) => {
        const dateStr = msg.createdAt.toDateString();
        const lastGroup = acc[acc.length - 1];

        if (lastGroup && lastGroup.date === dateStr) {
            lastGroup.messages.push(msg);
        } else {
            acc.push({ date: dateStr, messages: [msg] });
        }
        return acc;
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-border sticky top-0 z-10"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/sheikh/messages")}
                    aria-label="العودة"
                >
                    <ArrowRight size={20} />
                </Button>
                <div className="w-10 h-10 bg-sand rounded-full flex items-center justify-center">
                    <User size={20} className="text-emerald" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-emerald-deep truncate">
                        {threadInfo?.otherUserName || "جاري التحميل..."}
                    </h1>
                    {threadInfo?.circleId && (
                        <p className="text-xs text-text-muted">محادثة الحلقة</p>
                    )}
                </div>
            </motion.div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-sand/30">
                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4">
                        <MessageSkeleton isMine={false} />
                        <MessageSkeleton isMine={true} />
                        <MessageSkeleton isMine={false} />
                    </div>
                )}

                {/* Error */}
                {error && !isLoading && (
                    <Card className="my-8">
                        <EmptyState
                            icon={<Loader2 size={32} />}
                            title="خطأ في التحميل"
                            description={error}
                            action={{
                                label: "إعادة المحاولة",
                                onClick: () => window.location.reload(),
                            }}
                        />
                    </Card>
                )}

                {/* Empty Messages */}
                {!isLoading && !error && messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-text-muted">
                            <p className="mb-2">لا توجد رسائل بعد</p>
                            <p className="text-sm">ابدأ المحادثة الآن</p>
                        </div>
                    </div>
                )}

                {/* Messages with Date Separators */}
                {!isLoading && !error && groupedMessages.map((group) => (
                    <div key={group.date}>
                        <DateSeparator date={new Date(group.date)} />
                        <div className="space-y-3">
                            {group.messages.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <Composer onSend={sendMessage} />
        </div>
    );
}
