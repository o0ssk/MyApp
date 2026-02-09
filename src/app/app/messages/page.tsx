"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X, MessageSquare, UserCheck, Users } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

import { useThreads, useCreateThread } from "@/lib/hooks/useMessages";
import { useMembership } from "@/lib/hooks/useMembership";
import { useToast } from "@/components/ui/Toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ThreadCard, ThreadCardSkeleton } from "@/components/messages/ThreadCard";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { StudentBadge } from "@/components/ui/StudentBadge";
import { staggerContainer, fadeUp, pageTransition, listItem } from "@/lib/motion";

interface SheikhInfo {
    id: string;
    name: string;
    photoURL?: string;
    equippedBadge?: string;
    equippedFrame?: string;
}

export default function MessagesPage() {
    const router = useRouter();
    const { threads, isLoading, error } = useThreads();
    const { activeCircle } = useMembership();
    const { createOrOpenThread, isCreating } = useCreateThread();
    const { showToast } = useToast();

    const [searchQuery, setSearchQuery] = useState("");
    const [sheikhs, setSheikhs] = useState<SheikhInfo[]>([]);
    const [loadingSheikhs, setLoadingSheikhs] = useState(false);
    const [messagingSheikhId, setMessagingSheikhId] = useState<string | null>(null);

    // Fetch all sheikh info
    useEffect(() => {
        const fetchSheikhs = async () => {
            if (!activeCircle?.sheikhIds?.length) {
                setSheikhs([]);
                return;
            }

            setLoadingSheikhs(true);
            const sheikhData: SheikhInfo[] = [];

            for (const sheikhId of activeCircle.sheikhIds) {
                try {
                    const userDoc = await getDoc(doc(db, "users", sheikhId));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        sheikhData.push({
                            id: sheikhId,
                            name: data.name || "شيخ",
                            photoURL: data.photoURL,
                            equippedBadge: data.equippedBadge,
                            equippedFrame: data.equippedFrame,
                        });
                    }
                } catch (err) {
                    console.error("Error fetching sheikh:", err);
                }
            }

            setSheikhs(sheikhData);
            setLoadingSheikhs(false);
        };

        fetchSheikhs();
    }, [activeCircle?.sheikhIds]);

    // Filter threads by search
    const filteredThreads = threads.filter((t) =>
        t.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle message sheikh
    const handleMessageSheikh = async (sheikhId: string) => {
        if (!sheikhId) {
            showToast("لا يوجد شيخ مرتبط بالحلقة", "error");
            return;
        }

        setMessagingSheikhId(sheikhId);
        const result = await createOrOpenThread(sheikhId, activeCircle?.id);
        setMessagingSheikhId(null);

        if (result.success && result.threadId) {
            router.push(`/app/messages/${result.threadId}`);
        } else {
            showToast(result.error || "فشل في فتح المحادثة", "error");
        }
    };

    const handleOpenThread = (threadId: string) => {
        router.push(`/app/messages/${threadId}`);
    };

    const hasSheikhs = sheikhs.length > 0;

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
                        <h1 className="text-xl font-bold text-emerald-deep">الرسائل</h1>
                        <p className="text-sm text-text-muted">محادثاتك مع مشايخ الحلقة</p>
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

            {/* Sheikhs List - Quick Contact */}
            {hasSheikhs && (
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="mb-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users size={18} className="text-gold" />
                                مشايخ الحلقة
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {sheikhs.map((sheikh) => (
                                    <motion.button
                                        key={sheikh.id}
                                        variants={listItem}
                                        onClick={() => handleMessageSheikh(sheikh.id)}
                                        disabled={isCreating}
                                        className="flex items-center gap-3 p-3 bg-sand/50 hover:bg-sand rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        <StudentAvatar
                                            student={{
                                                name: sheikh.name,
                                                photoURL: sheikh.photoURL,
                                                equippedFrame: sheikh.equippedFrame,
                                                equippedBadge: sheikh.equippedBadge,
                                            }}
                                            size="sm"
                                        />
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-deep text-sm flex items-center gap-1">
                                                {sheikh.name}
                                                <StudentBadge badgeId={sheikh.equippedBadge} size="sm" />
                                            </p>
                                            <p className="text-xs text-text-muted">مراسلة</p>
                                        </div>
                                        {messagingSheikhId === sheikh.id && (
                                            <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

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
                            description={hasSheikhs ? "اختر أحد المشايخ أعلاه لبدء محادثة" : "لا توجد حلقة نشطة للتواصل"}
                            action={
                                !hasSheikhs
                                    ? {
                                        label: "العودة للوحة التحكم",
                                        onClick: () => router.push("/student"),
                                    }
                                    : undefined
                            }
                        />
                    </Card>
                )}

                {/* No Results */}
                {!isLoading && !error && threads.length > 0 && filteredThreads.length === 0 && (
                    <Card className="text-center py-8">
                        <p className="text-text-muted">لا توجد نتائج للبحث &quot;{searchQuery}&quot;</p>
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
