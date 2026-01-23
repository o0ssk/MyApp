"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X, MessageSquare } from "lucide-react";

import { useThreads } from "@/lib/hooks/useMessages";
import { useToast } from "@/components/ui/Toast";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ThreadCard, ThreadCardSkeleton } from "@/components/messages/ThreadCard";
import { staggerContainer, fadeUp, pageTransition } from "@/lib/motion";

export default function SheikhMessagesPage() {
    const router = useRouter();
    const { threads, isLoading, error } = useThreads();
    const { showToast } = useToast();

    const [searchQuery, setSearchQuery] = useState("");

    // Filter threads by search
    const filteredThreads = threads.filter((t) =>
        t.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenThread = (threadId: string) => {
        router.push(`/sheikh/messages/${threadId}`);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-emerald-deep flex items-center gap-2">
                            <MessageSquare size={24} className="text-gold" />
                            الرسائل
                        </h1>
                        <p className="text-sm text-text-muted">محادثاتك مع الطلاب</p>
                    </div>
                </div>

                {/* Search */}
                {threads.length > 0 && (
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث في المحادثات..."
                            className="w-full px-4 py-3 pr-11 bg-surface border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50"
                            aria-label="بحث في المحادثات"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-emerald"
                                aria-label="مسح البحث"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Content */}
            <motion.div
                variants={pageTransition}
                initial="hidden"
                animate="visible"
            >
                {/* Loading */}
                {isLoading && (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <ThreadCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && !isLoading && (
                    <Card>
                        <EmptyState
                            icon={<MessageSquare size={40} />}
                            title="خطأ في التحميل"
                            description={error}
                            action={{
                                label: "إعادة المحاولة",
                                onClick: () => window.location.reload(),
                            }}
                        />
                    </Card>
                )}

                {/* Empty State */}
                {!isLoading && !error && threads.length === 0 && (
                    <Card>
                        <EmptyState
                            icon={<MessageSquare size={40} />}
                            title="لا توجد رسائل بعد"
                            description="ستظهر المحادثات مع الطلاب هنا"
                        />
                    </Card>
                )}

                {/* No Results */}
                {!isLoading && !error && threads.length > 0 && filteredThreads.length === 0 && (
                    <Card className="text-center py-8">
                        <p className="text-text-muted">لا توجد نتائج للبحث "{searchQuery}"</p>
                        <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="mt-2">
                            مسح البحث
                        </Button>
                    </Card>
                )}

                {/* Threads List */}
                {!isLoading && !error && filteredThreads.length > 0 && (
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3"
                    >
                        {filteredThreads.map((thread) => (
                            <ThreadCard
                                key={thread.id}
                                thread={thread}
                                onClick={() => handleOpenThread(thread.id)}
                            />
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
