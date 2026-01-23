"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, X, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LogFilters } from "@/lib/hooks/useLogs";
import { fadeUp } from "@/lib/motion";

interface FiltersPanelProps {
    filters: LogFilters;
    onFiltersChange: (filters: Partial<LogFilters>) => void;
    onClearFilters: () => void;
}

const months = [
    { value: "", label: "كل الأشهر" },
    { value: "2026-01", label: "يناير 2026" },
    { value: "2025-12", label: "ديسمبر 2025" },
    { value: "2025-11", label: "نوفمبر 2025" },
    { value: "2025-10", label: "أكتوبر 2025" },
];

// Generate current month option dynamically
function getCurrentMonthOption() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const monthNames = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    return {
        value: `${year}-${month}`,
        label: `${monthNames[now.getMonth()]} ${year}`,
    };
}

const typeOptions = [
    { value: "", label: "الكل" },
    { value: "memorization", label: "حفظ" },
    { value: "revision", label: "مراجعة" },
];

const statusOptions = [
    { value: "", label: "الكل" },
    { value: "pending_approval", label: "بانتظار الاعتماد" },
    { value: "approved", label: "معتمد" },
    { value: "rejected", label: "مرفوض" },
];

export function FiltersPanel({ filters, onFiltersChange, onClearFilters }: FiltersPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const hasActiveFilters = filters.type || filters.status || filters.month || filters.search;

    const activeFilterChips: { key: string; label: string }[] = [];
    if (filters.type) {
        activeFilterChips.push({
            key: "type",
            label: filters.type === "memorization" ? "حفظ" : "مراجعة",
        });
    }
    if (filters.status) {
        const statusLabel = statusOptions.find((o) => o.value === filters.status)?.label || "";
        activeFilterChips.push({ key: "status", label: statusLabel });
    }
    if (filters.month) {
        activeFilterChips.push({ key: "month", label: filters.month });
    }
    if (filters.search) {
        activeFilterChips.push({ key: "search", label: `بحث: ${filters.search}` });
    }

    const removeFilter = (key: string) => {
        onFiltersChange({ [key]: key === "search" ? "" : null });
    };

    return (
        <Card className="mb-6">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 text-right"
                aria-expanded={isExpanded}
                aria-controls="filters-content"
            >
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-emerald" />
                    <span className="font-medium text-emerald-deep">الفلاتر</span>
                    {hasActiveFilters && (
                        <Badge variant="info" size="sm">
                            {activeFilterChips.length}
                        </Badge>
                    )}
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={20} className="text-text-muted" />
                </motion.div>
            </button>

            {/* Filters Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        id="filters-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-emerald-deep mb-2">
                                    بحث
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={filters.search || ""}
                                        onChange={(e) => onFiltersChange({ search: e.target.value })}
                                        placeholder="ابحث بالسورة أو الصفحات أو الملاحظات..."
                                        className="w-full px-4 py-3 pr-11 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50"
                                        aria-label="بحث في السجلات"
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                </div>
                            </div>

                            {/* Filter Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Month */}
                                <div>
                                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                                        الشهر
                                    </label>
                                    <select
                                        value={filters.month || ""}
                                        onChange={(e) => onFiltersChange({ month: e.target.value || undefined })}
                                        className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none cursor-pointer"
                                        aria-label="تصفية حسب الشهر"
                                    >
                                        <option value="">كل الأشهر</option>
                                        <option value={getCurrentMonthOption().value}>
                                            {getCurrentMonthOption().label}
                                        </option>
                                        {months.slice(1).map((m) => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                                        النوع
                                    </label>
                                    <select
                                        value={filters.type || ""}
                                        onChange={(e) => onFiltersChange({ type: e.target.value as any || null })}
                                        className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none cursor-pointer"
                                        aria-label="تصفية حسب النوع"
                                    >
                                        {typeOptions.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                                        الحالة
                                    </label>
                                    <select
                                        value={filters.status || ""}
                                        onChange={(e) => onFiltersChange({ status: e.target.value as any || null })}
                                        className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none cursor-pointer"
                                        aria-label="تصفية حسب الحالة"
                                    >
                                        {statusOptions.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Active Filters Chips */}
                            {activeFilterChips.length > 0 && (
                                <motion.div
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    className="flex flex-wrap gap-2"
                                >
                                    {activeFilterChips.map((chip) => (
                                        <Badge key={chip.key} variant="info" className="flex items-center gap-1 px-3 py-1">
                                            {chip.label}
                                            <button
                                                onClick={() => removeFilter(chip.key)}
                                                className="mr-1 hover:text-red-500 transition-colors"
                                                aria-label={`إزالة فلتر ${chip.label}`}
                                            >
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    ))}
                                    <Button variant="ghost" size="sm" onClick={onClearFilters}>
                                        <RotateCcw size={14} />
                                        إعادة تعيين
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
