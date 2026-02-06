"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, User, Loader2, MessageSquare, Send } from "lucide-react";

import { useThreadMessages } from "@/lib/hooks/useMessages";
import { useAuth } from "@/lib/auth/hooks";
import { Avatar } from "@/components/ui/Avatar";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageBubble, DateSeparator, MessageSkeleton } from "@/components/messages/MessageBubble";
import { Composer } from "@/components/messages/Composer";
import { fadeUp } from "@/lib/motion";

export default function SheikhThreadPage() {
    const params = useParams();
    const router = useRouter();
    const threadIdOrUserId = params.threadId as string;
    const { user } = useAuth();

    const {
        messages,
        threadInfo,
        isLoading,
        error,
        sendMessage,
        markAsRead,
        isNewConversation,
        resolvedThreadId,
    } = useThreadMessages(threadIdOrUserId);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasMarkedRead = useRef(false);
    const [sendError, setSendError] = useState<string | null>(null);

    // Mark as read on mount (only for existing threads with messages)
    useEffect(() => {
        if (resolvedThreadId && !hasMarkedRead.current && messages.length > 0) {
            hasMarkedRead.current = true;
            markAsRead();
        }
    }, [resolvedThreadId, messages.length, markAsRead]);

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

    // Handle send with error display
    const handleSend = async (content: string) => {
        setSendError(null);
        const result = await sendMessage(content);
        if (!result.success && result.error) {
            setSendError(result.error);
        }
        return result;
    };

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

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald/10 bg-sand">
                    {threadInfo?.otherUserAvatar ? (
                        <Avatar
                            src={threadInfo.otherUserAvatar}
                            name={threadInfo.otherUserName}
                            size="sm"
                            className="w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User size={20} className="text-emerald" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-emerald-deep truncate">
                        {isLoading ? "جاري التحميل..." : threadInfo?.otherUserName || "مستخدم"}
                    </h1>
                    {isNewConversation && !isLoading && (
                        <p className="text-xs text-gold">محادثة جديدة</p>
                    )}
                    {threadInfo?.circleId && !isNewConversation && (
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

                {/* New Conversation Welcome */}
                {!isLoading && !error && isNewConversation && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={32} className="text-emerald" />
                        </div>
                        <h3 className="font-bold text-emerald-deep mb-2">
                            بدء محادثة جديدة
                        </h3>
                        <p className="text-text-muted text-sm mb-4">
                            مع {threadInfo?.otherUserName || "الطالب"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Send size={14} />
                            <span>أرسل رسالتك الأولى للبدء</span>
                        </div>
                    </div>
                )}

                {/* Empty Messages (Existing Thread) */}
                {!isLoading && !error && !isNewConversation && messages.length === 0 && (
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

            {/* Send Error Banner */}
            {sendError && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center">
                        {sendError}
                    </p>
                </div>
            )}

            {/* Composer */}
            <Composer onSend={handleSend} disabled={isLoading || !!error} />
        </div>
    );
}
