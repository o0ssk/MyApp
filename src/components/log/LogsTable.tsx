"use client";

import { motion } from "framer-motion";
import { BookOpen, RotateCcw, Eye, Edit3, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Log } from "@/lib/hooks/useLogs";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { listItem, staggerContainer } from "@/lib/motion";

interface LogsTableProps {
    logs: Log[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    onViewDetails: (log: Log) => void;
    onEditNotes: (log: Log) => void;
    onAddLog: () => void;
}

export function LogsTable({
    logs,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
    onViewDetails,
    onEditNotes,
    onAddLog,
}: LogsTableProps) {
    if (isLoading) {
        return (
            <Card>
                <div className="space-y-3 p-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-sand/50">
                            <Skeleton className="w-20 h-4" />
                            <Skeleton className="w-16 h-4" />
                            <Skeleton className="w-24 h-4 flex-1" />
                            <Skeleton className="w-20 h-6" />
                            <Skeleton className="w-24 h-4" />
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    if (logs.length === 0) {
        return (
            <Card>
                <EmptyState
                    icon={<BookOpen size={40} />}
                    title="لا توجد سجلات"
                    description="لم يتم العثور على سجلات مطابقة للفلاتر المحددة"
                    action={{
                        label: "إضافة سجل جديد",
                        onClick: onAddLog,
                    }}
                />
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Sticky Header */}
                    <thead className="bg-sand/50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-emerald-deep">
                                التاريخ
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-emerald-deep">
                                النوع
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-emerald-deep">
                                المقدار
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-emerald-deep">
                                الحالة
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-emerald-deep">
                                ملاحظات الشيخ
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-emerald-deep">
                                إجراءات
                            </th>
                        </tr>
                    </thead>
                    {/* Body with stagger animation */}
                    <motion.tbody
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {logs.map((log, index) => (
                            <motion.tr
                                key={log.id}
                                variants={listItem}
                                className={`border-t border-border hover:bg-sand/30 transition-colors ${index % 2 === 0 ? "bg-surface" : "bg-sand/10"
                                    }`}
                            >
                                {/* Date */}
                                <td className="px-4 py-3 text-sm text-text">
                                    {new Date(log.date).toLocaleDateString("ar-SA", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </td>

                                {/* Type */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.type === "memorization"
                                                    ? "bg-gold/10 text-gold"
                                                    : "bg-emerald/10 text-emerald"
                                                }`}
                                        >
                                            {log.type === "memorization" ? (
                                                <BookOpen size={16} />
                                            ) : (
                                                <RotateCcw size={16} />
                                            )}
                                        </div>
                                        <span className="text-sm text-text">
                                            {log.type === "memorization" ? "حفظ" : "مراجعة"}
                                        </span>
                                    </div>
                                </td>

                                {/* Amount */}
                                <td className="px-4 py-3 text-sm text-text">
                                    {log.amount.pages
                                        ? `${log.amount.pages} صفحة`
                                        : `${log.amount.surah} (${log.amount.ayahFrom}-${log.amount.ayahTo})`}
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3">
                                    <StatusBadge status={log.status} />
                                </td>

                                {/* Teacher Notes */}
                                <td className="px-4 py-3 text-sm text-text-muted max-w-[150px]">
                                    {log.teacherNotes ? (
                                        <span className="truncate block" title={log.teacherNotes}>
                                            {log.teacherNotes.slice(0, 30)}
                                            {log.teacherNotes.length > 30 ? "..." : ""}
                                        </span>
                                    ) : (
                                        <span className="text-text-light">—</span>
                                    )}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewDetails(log)}
                                            aria-label="عرض التفاصيل"
                                        >
                                            <Eye size={16} />
                                            عرض
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEditNotes(log)}
                                            aria-label="تعديل الملاحظات"
                                        >
                                            <Edit3 size={16} />
                                        </Button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
            </div>

            {/* Pagination */}
            {hasMore && (
                <div className="flex justify-center p-4 border-t border-border">
                    <Button
                        variant="secondary"
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        isLoading={isLoadingMore}
                    >
                        {isLoadingMore ? "جاري التحميل..." : "تحميل المزيد"}
                    </Button>
                </div>
            )}
        </Card>
    );
}
