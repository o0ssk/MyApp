"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, X, MessageSquare, Users, UserPlus, ChevronLeft } from "lucide-react";

import { useThreads } from "@/lib/hooks/useMessages";
import { useSheikhCircles } from "@/lib/hooks/useSheikh";
import { useSheikhStudents, Student } from "@/lib/hooks/useSheikhStudents";
import { useToast } from "@/components/ui/Toast";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { ThreadCard, ThreadCardSkeleton } from "@/components/messages/ThreadCard";
import { staggerContainer, fadeUp, listItem, pageTransition } from "@/lib/motion";

type TabType = "threads" | "students";

export default function SheikhMessagesPage() {
    const router = useRouter();
    const { threads, isLoading: threadsLoading, error: threadsError } = useThreads();
    const { circles, isLoading: circlesLoading } = useSheikhCircles();
    const circleIds = useMemo(() => circles.map((c) => c.id), [circles]);
    const { students, isLoading: studentsLoading, error: studentsError } = useSheikhStudents(circleIds);
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<TabType>("threads");
    const [searchQuery, setSearchQuery] = useState("");

    const isLoading = activeTab === "threads" ? threadsLoading : (circlesLoading || studentsLoading);
    const error = activeTab === "threads" ? threadsError : studentsError;

    // Filter threads by search
    const filteredThreads = threads.filter((t) =>
        t.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter students by search
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const q = searchQuery.toLowerCase();
        return students.filter((s) => s.odei.toLowerCase().includes(q));
    }, [students, searchQuery]);

    const handleOpenThread = (threadId: string) => {
        router.push(`/sheikh/messages/${threadId}`);
    };

    const handleMessageStudent = (studentId: string) => {
        // Navigate to start/open a chat with this student
        // The thread ID format can be derived or we navigate to a create-thread endpoint
        router.push(`/sheikh/messages/${studentId}`);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
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
                        <p className="text-sm text-text-muted">تواصل مع طلابك</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => { setActiveTab("threads"); setSearchQuery(""); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "threads"
                            ? "bg-emerald text-white"
                            : "bg-surface border border-border text-text hover:bg-sand"
                            }`}
                    >
                        <MessageSquare size={16} />
                        المحادثات
                        {threads.length > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === "threads" ? "bg-white/20" : "bg-emerald/10 text-emerald"
                                }`}>
                                {threads.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => { setActiveTab("students"); setSearchQuery(""); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "students"
                            ? "bg-emerald text-white"
                            : "bg-surface border border-border text-text hover:bg-sand"
                            }`}
                    >
                        <UserPlus size={16} />
                        محادثة جديدة
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={activeTab === "threads" ? "بحث في المحادثات..." : "بحث عن طالب..."}
                        className="w-full px-4 py-3 pr-11 bg-surface border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50"
                        aria-label="بحث"
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
                            activeTab === "threads" ? (
                                <ThreadCardSkeleton key={i} />
                            ) : (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="h-16" />
                                </Card>
                            )
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

                {/* Threads Tab */}
                {activeTab === "threads" && !isLoading && !error && (
                    <>
                        {/* Empty State */}
                        {threads.length === 0 && (
                            <Card>
                                <EmptyState
                                    icon={<MessageSquare size={40} />}
                                    title="لا توجد رسائل بعد"
                                    description="ابدأ محادثة جديدة مع أحد طلابك"
                                    action={{
                                        label: "محادثة جديدة",
                                        onClick: () => setActiveTab("students"),
                                    }}
                                />
                            </Card>
                        )}

                        {/* No Results */}
                        {threads.length > 0 && filteredThreads.length === 0 && (
                            <Card className="text-center py-8">
                                <p className="text-text-muted">لا توجد نتائج للبحث &quot;{searchQuery}&quot;</p>
                                <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="mt-2">
                                    مسح البحث
                                </Button>
                            </Card>
                        )}

                        {/* Threads List */}
                        {filteredThreads.length > 0 && (
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
                    </>
                )}

                {/* Students Tab */}
                {activeTab === "students" && !isLoading && !error && (
                    <>
                        {/* Empty State */}
                        {students.length === 0 && (
                            <Card>
                                <EmptyState
                                    icon={<Users size={40} />}
                                    title="لا يوجد طلاب"
                                    description="سيظهر الطلاب هنا بمجرد قبول طلبات الانضمام للحلقات"
                                />
                            </Card>
                        )}

                        {/* No Results */}
                        {students.length > 0 && filteredStudents.length === 0 && (
                            <Card className="text-center py-8">
                                <p className="text-text-muted">لا توجد نتائج للبحث &quot;{searchQuery}&quot;</p>
                                <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="mt-2">
                                    مسح البحث
                                </Button>
                            </Card>
                        )}

                        {/* Students Grid */}
                        {filteredStudents.length > 0 && (
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="grid gap-3 sm:grid-cols-2"
                            >
                                {filteredStudents.map((student) => (
                                    <motion.div key={student.id} variants={listItem}>
                                        <StudentContactCard
                                            student={student}
                                            onMessage={() => handleMessageStudent(student.odeiUserId)}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
}

// Student Contact Card Component
function StudentContactCard({ student, onMessage }: { student: Student; onMessage: () => void }) {
    return (
        <Card className="hover:shadow-md hover:border-emerald/30 transition-all cursor-pointer group" onClick={onMessage}>
            <CardContent className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald/10 overflow-hidden bg-sand group-hover:border-emerald/30 transition-colors">
                        <Avatar
                            src={student.avatar}
                            name={student.odei}
                            size="md"
                            className="w-full h-full"
                        />
                    </div>
                    {/* Active indicator */}
                    {student.isActive && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface bg-emerald" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-emerald-deep truncate">{student.odei}</h3>
                    <p className="text-sm text-text-muted truncate flex items-center gap-1">
                        <Users size={14} />
                        {student.circleName}
                    </p>
                </div>

                {/* Message Icon */}
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-emerald/10 text-emerald group-hover:bg-emerald group-hover:text-white transition-colors">
                        <MessageSquare size={18} />
                    </div>
                    <ChevronLeft size={18} className="text-text-muted group-hover:text-emerald transition-colors" />
                </div>
            </CardContent>
        </Card>
    );
}
