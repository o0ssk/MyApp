"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Edit3, Check, X, BookOpen, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth/hooks";
import { useStudentGoals, StudentGoals } from "@/lib/hooks/useStudentGoals";
import { useLogs, LogStats } from "@/lib/hooks/useLogs";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface GoalTrackerProps {
    circleId: string | null;
}

type TabType = "daily" | "monthly";

// ─────────────────────────────────────────────────────────────────────────────
// Default Targets
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TARGETS = {
    dailyMemoTarget: 1,
    dailyReviewTarget: 5,
    monthlyMemoTarget: 20,
    monthlyReviewTarget: 100,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Calculate today's stats from logs
// ─────────────────────────────────────────────────────────────────────────────

function getTodayStats(weeklyChartData: LogStats["weeklyChartData"]): { hifz: number; review: number } {
    // weeklyChartData has the last 7 days, the last entry is today
    if (!weeklyChartData || weeklyChartData.length === 0) {
        return { hifz: 0, review: 0 };
    }
    const today = weeklyChartData[weeklyChartData.length - 1];
    return {
        hifz: today?.memorized || 0,
        review: today?.revised || 0,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function GoalTracker({ circleId }: GoalTrackerProps) {
    const { userProfile } = useAuth();
    const { goals, isLoading: goalsLoading, updateGoals } = useStudentGoals(userProfile?.uid);
    const { stats, isLoading: statsLoading } = useLogs(circleId);
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<TabType>("daily");
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state for editing
    const [editForm, setEditForm] = useState({
        dailyMemoTarget: 0,
        dailyReviewTarget: 0,
        monthlyMemoTarget: 0,
        monthlyReviewTarget: 0,
    });

    // Targets with defaults
    const targets = {
        dailyMemo: goals.dailyMemoTarget ?? DEFAULT_TARGETS.dailyMemoTarget,
        dailyReview: goals.dailyReviewTarget ?? DEFAULT_TARGETS.dailyReviewTarget,
        monthlyMemo: goals.monthlyMemoTarget ?? DEFAULT_TARGETS.monthlyMemoTarget,
        monthlyReview: goals.monthlyReviewTarget ?? DEFAULT_TARGETS.monthlyReviewTarget,
    };

    // Actual progress
    const todayStats = getTodayStats(stats.weeklyChartData);
    const actual = {
        dailyHifz: todayStats.hifz,
        dailyReview: todayStats.review,
        monthlyHifz: stats.memorizationPages,
        monthlyReview: stats.revisionPages,
    };

    const isLoading = goalsLoading || statsLoading;

    // Open edit modal with current values
    const openEditModal = () => {
        setEditForm({
            dailyMemoTarget: targets.dailyMemo,
            dailyReviewTarget: targets.dailyReview,
            monthlyMemoTarget: targets.monthlyMemo,
            monthlyReviewTarget: targets.monthlyReview,
        });
        setShowEditModal(true);
    };

    // Save goals
    const handleSaveGoals = async () => {
        setIsSaving(true);
        const result = await updateGoals({
            dailyMemoTarget: editForm.dailyMemoTarget,
            dailyReviewTarget: editForm.dailyReviewTarget,
            monthlyMemoTarget: editForm.monthlyMemoTarget,
            monthlyReviewTarget: editForm.monthlyReviewTarget,
        });

        if (result.success) {
            showToast("تم حفظ الأهداف بنجاح", "success");
            setShowEditModal(false);
        } else {
            showToast(result.error || "فشل في حفظ الأهداف", "error");
        }
        setIsSaving(false);
    };

    // Tab data
    const tabData = {
        daily: {
            hifz: { actual: actual.dailyHifz, target: targets.dailyMemo },
            review: { actual: actual.dailyReview, target: targets.dailyReview },
            label: "اليوم",
        },
        monthly: {
            hifz: { actual: actual.monthlyHifz, target: targets.monthlyMemo },
            review: { actual: actual.monthlyReview, target: targets.monthlyReview },
            label: "هذا الشهر",
        },
    };

    const currentData = tabData[activeTab];
    const hifzComplete = currentData.hifz.actual >= currentData.hifz.target;
    const reviewComplete = currentData.review.actual >= currentData.review.target;
    const allComplete = hifzComplete && reviewComplete;

    // Loading state
    if (isLoading) {
        return (
            <Card className="animate-pulse">
                <CardHeader>
                    <div className="h-6 bg-sand rounded w-1/3" />
                </CardHeader>
                <div className="space-y-4">
                    <div className="h-12 bg-sand rounded" />
                    <div className="h-12 bg-sand rounded" />
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card className="relative overflow-hidden">
                {/* Celebration overlay when all goals complete */}
                <AnimatePresence>
                    {allComplete && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-gold/5 pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                {/* Header */}
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald/10 rounded-xl">
                            <Target className="w-5 h-5 text-emerald" />
                        </div>
                        <div>
                            <CardTitle>أهدافي الحالية</CardTitle>
                            <p className="text-sm text-text-muted mt-0.5">تتبع تقدمك {currentData.label}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={openEditModal}>
                        <Edit3 size={16} />
                        <span className="mr-1">تعديل</span>
                    </Button>
                </CardHeader>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(["daily", "monthly"] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === tab
                                    ? "bg-emerald text-white shadow-sm"
                                    : "bg-sand text-text-muted hover:bg-sand/80"
                                }`}
                        >
                            {tab === "daily" ? "يومي" : "شهري"}
                        </button>
                    ))}
                </div>

                {/* Progress Bars */}
                <div className="space-y-6">
                    {/* Hifz Progress */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald" />
                            <span className="text-sm font-medium text-emerald-deep">الحفظ</span>
                            {hifzComplete && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-emerald/10 text-emerald rounded-full">
                                    تم الإنجاز ✓
                                </span>
                            )}
                        </div>
                        <ProgressBar
                            value={currentData.hifz.actual}
                            max={currentData.hifz.target}
                            color="emerald"
                            size="lg"
                        />
                    </div>

                    {/* Review Progress */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <RotateCcw className="w-4 h-4 text-gold" />
                            <span className="text-sm font-medium text-emerald-deep">المراجعة</span>
                            {reviewComplete && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-gold/10 text-gold rounded-full">
                                    تم الإنجاز ✓
                                </span>
                            )}
                        </div>
                        <ProgressBar
                            value={currentData.review.actual}
                            max={currentData.review.target}
                            color="gold"
                            size="lg"
                        />
                    </div>
                </div>

                {/* All Goals Complete Message */}
                {allComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-gradient-to-r from-emerald/10 to-gold/10 rounded-xl border border-emerald/20 text-center"
                    >
                        <span className="text-2xl">🎉</span>
                        <p className="text-sm font-bold text-emerald-deep mt-1">
                            أحسنت! أتممت جميع أهداف {currentData.label}
                        </p>
                    </motion.div>
                )}
            </Card>

            {/* Edit Goals Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="تعديل الأهداف" size="md">
                <div className="space-y-6">
                    {/* Daily Goals Section */}
                    <div>
                        <h3 className="text-sm font-bold text-emerald-deep mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald" />
                            الأهداف اليومية
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-text-muted mb-2">صفحات الحفظ</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={editForm.dailyMemoTarget}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, dailyMemoTarget: parseInt(e.target.value) || 0 })
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-center text-lg font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-2">صفحات المراجعة</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={editForm.dailyReviewTarget}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, dailyReviewTarget: parseInt(e.target.value) || 0 })
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-center text-lg font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Monthly Goals Section */}
                    <div>
                        <h3 className="text-sm font-bold text-emerald-deep mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold" />
                            الأهداف الشهرية
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-text-muted mb-2">صفحات الحفظ</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={editForm.monthlyMemoTarget}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, monthlyMemoTarget: parseInt(e.target.value) || 0 })
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-center text-lg font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-2">صفحات المراجعة</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={editForm.monthlyReviewTarget}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, monthlyReviewTarget: parseInt(e.target.value) || 0 })
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-center text-lg font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                        <Button variant="ghost" onClick={() => setShowEditModal(false)} className="flex-1">
                            <X size={16} />
                            <span className="mr-1">إلغاء</span>
                        </Button>
                        <Button variant="primary" onClick={handleSaveGoals} disabled={isSaving} className="flex-1">
                            <Check size={16} />
                            <span className="mr-1">{isSaving ? "جارٍ الحفظ..." : "حفظ الأهداف"}</span>
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
