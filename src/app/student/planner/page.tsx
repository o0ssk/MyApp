"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Calendar, Check, AlertTriangle, BookOpen, Target, RotateCcw } from "lucide-react";

// Days of the week in Arabic
const DAYS_OF_WEEK = [
    { id: "sunday", label: "الأحد", short: "أ" },
    { id: "monday", label: "الإثنين", short: "إ" },
    { id: "tuesday", label: "الثلاثاء", short: "ث" },
    { id: "wednesday", label: "الأربعاء", short: "ر" },
    { id: "thursday", label: "الخميس", short: "خ" },
    { id: "friday", label: "الجمعة", short: "ج" },
    { id: "saturday", label: "السبت", short: "س" },
];

const TOTAL_PAGES = 604;
const REVIEW_RATIO = 20; // Review 20 pages for every new page

export default function KhatmahPlannerPage() {
    const [currentProgress, setCurrentProgress] = useState(0);
    const [durationMonths, setDurationMonths] = useState(24); // Default: 2 years
    const [offDays, setOffDays] = useState<string[]>(["friday"]); // Default: Friday off

    // Calculate target date based on duration
    const targetDate = useMemo(() => {
        const date = new Date();
        date.setMonth(date.getMonth() + durationMonths);
        return date;
    }, [durationMonths]);

    // Format target date in Arabic
    const formattedTargetDate = useMemo(() => {
        return targetDate.toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }, [targetDate]);

    // Calculate remaining pages
    const remainingPages = TOTAL_PAGES - currentProgress;

    // Calculate total days and active days
    const { totalDays, activeDays } = useMemo(() => {
        const today = new Date();
        const diffTime = targetDate.getTime() - today.getTime();
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate number of off days per week
        const offDaysPerWeek = offDays.length;
        const activeDaysPerWeek = 7 - offDaysPerWeek;

        // Approximate active days
        const weeks = totalDays / 7;
        const activeDays = Math.floor(weeks * activeDaysPerWeek);

        return { totalDays, activeDays: Math.max(1, activeDays) };
    }, [targetDate, offDays]);

    // Calculate daily hifz requirement
    const dailyHifz = remainingPages / activeDays;

    // Calculate daily review requirement
    const dailyReview = dailyHifz * REVIEW_RATIO;

    // Determine intensity level and color
    const getIntensityInfo = (pages: number) => {
        if (pages < 0.5) {
            return {
                level: "سهل",
                color: "success",
                bgColor: "bg-success/10",
                textColor: "text-success",
                borderColor: "border-success/20",
            };
        } else if (pages <= 2) {
            return {
                level: "متوسط",
                color: "info",
                bgColor: "bg-info/10",
                textColor: "text-info",
                borderColor: "border-info/20",
            };
        } else {
            return {
                level: "مكثف",
                color: "warning",
                bgColor: "bg-warning/10",
                textColor: "text-warning",
                borderColor: "border-warning/20",
            };
        }
    };

    const intensity = getIntensityInfo(dailyHifz);

    // Toggle off day
    const toggleOffDay = (dayId: string) => {
        setOffDays((prev) =>
            prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
        );
    };

    // Duration labels
    const getDurationLabel = (months: number) => {
        if (months < 12) return `${months} أشهر`;
        const years = months / 12;
        if (years === 1) return "سنة واحدة";
        if (years === 2) return "سنتان";
        if (years <= 10) return `${years} سنوات`;
        return `${years} سنة`;
    };

    return (
        <div className="min-h-screen bg-sand">
            {/* Header */}
            <div className="bg-emerald text-white px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="p-3 bg-white/10 rounded-2xl">
                            <Calculator size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">مخطط الختمة الذكي</h1>
                            <p className="text-white/70 text-sm mt-1">خطط ورد حفظك بشكل واقعي</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Side - Inputs */}
                    <div className="space-y-6">
                        {/* Current Progress Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-surface rounded-2xl p-6 border border-border shadow-soft"
                        >
                            <label className="block text-sm font-medium text-text-muted mb-3">
                                <BookOpen size={16} className="inline ml-2" />
                                كم صفحة تحفظ حالياً؟
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max={TOTAL_PAGES - 1}
                                    value={currentProgress}
                                    onChange={(e) =>
                                        setCurrentProgress(
                                            Math.min(TOTAL_PAGES - 1, Math.max(0, Number(e.target.value)))
                                        )
                                    }
                                    className="w-full text-3xl font-bold text-emerald bg-sand/50 border-2 border-border rounded-xl px-6 py-4 focus:outline-none focus:border-emerald/40 transition-colors text-center"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                                    صفحة
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm text-text-muted">
                                <span>المتبقي: {remainingPages} صفحة</span>
                                <span>التقدم: {((currentProgress / TOTAL_PAGES) * 100).toFixed(1)}%</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-3 h-2 bg-sand rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-l from-gold to-emerald"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(currentProgress / TOTAL_PAGES) * 100}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                        </motion.div>

                        {/* Duration Slider Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-surface rounded-2xl p-6 border border-border shadow-soft"
                        >
                            <label className="block text-sm font-medium text-text-muted mb-3">
                                <Target size={16} className="inline ml-2" />
                                المدة المستهدفة
                            </label>

                            <div className="text-center mb-4">
                                <span className="text-3xl font-bold text-emerald">
                                    {getDurationLabel(durationMonths)}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="6"
                                max="60"
                                step="6"
                                value={durationMonths}
                                onChange={(e) => setDurationMonths(Number(e.target.value))}
                                className="w-full h-3 rounded-full appearance-none cursor-pointer bg-sand accent-emerald"
                                style={{
                                    background: `linear-gradient(to left, #0F3D2E ${((durationMonths - 6) / 54) * 100}%, #F6F1E7 ${((durationMonths - 6) / 54) * 100}%)`,
                                }}
                            />

                            <div className="flex justify-between text-xs text-text-muted mt-2">
                                <span>6 أشهر</span>
                                <span>5 سنوات</span>
                            </div>

                            {/* Target Date Display */}
                            <div className="mt-4 p-4 bg-gold/10 rounded-xl border border-gold/20">
                                <div className="flex items-center gap-2 text-gold">
                                    <Calendar size={18} />
                                    <span className="font-medium">تاريخ الإنتهاء المتوقع</span>
                                </div>
                                <p className="text-lg font-bold text-emerald mt-2">
                                    {formattedTargetDate}
                                </p>
                            </div>
                        </motion.div>

                        {/* Weekly Off Days Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-surface rounded-2xl p-6 border border-border shadow-soft"
                        >
                            <label className="block text-sm font-medium text-text-muted mb-3">
                                <RotateCcw size={16} className="inline ml-2" />
                                أيام العطلة الأسبوعية
                            </label>

                            <div className="flex flex-wrap gap-2">
                                {DAYS_OF_WEEK.map((day) => {
                                    const isOff = offDays.includes(day.id);
                                    return (
                                        <motion.button
                                            key={day.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleOffDay(day.id)}
                                            className={`
                                                px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                                                ${isOff
                                                    ? "bg-emerald text-white shadow-soft"
                                                    : "bg-sand text-text-muted hover:bg-emerald/10"
                                                }
                                            `}
                                        >
                                            <span className="hidden sm:inline">{day.label}</span>
                                            <span className="sm:hidden">{day.short}</span>
                                            {isOff && <Check size={14} className="inline mr-1" />}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <p className="text-sm text-text-muted mt-4">
                                أيام الحفظ الفعلية: <span className="font-bold text-emerald">{7 - offDays.length}</span> أيام في الأسبوع
                            </p>
                        </motion.div>
                    </div>

                    {/* Right Side - Results */}
                    <div className="space-y-6">
                        {/* Main Result Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`
                                rounded-2xl p-6 border-2 shadow-elevated
                                ${intensity.bgColor} ${intensity.borderColor}
                            `}
                        >
                            <div className="text-center">
                                <h2 className="text-lg font-medium text-text-muted mb-2">
                                    وردك اليومي المقترح
                                </h2>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={dailyHifz.toFixed(2)}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="my-6"
                                    >
                                        <span className={`text-6xl font-bold ${intensity.textColor}`}>
                                            {dailyHifz.toFixed(1)}
                                        </span>
                                        <span className="text-2xl text-text-muted mr-2">صفحة</span>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Intensity Badge */}
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                    className={`
                                        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                        ${intensity.bgColor} ${intensity.textColor}
                                    `}
                                >
                                    {dailyHifz > 2 && <AlertTriangle size={16} />}
                                    <span>مستوى الكثافة: {intensity.level}</span>
                                </motion.div>

                                {/* High Intensity Warning */}
                                <AnimatePresence>
                                    {dailyHifz > 2 && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-xl text-warning text-sm"
                                        >
                                            <AlertTriangle size={16} className="inline ml-1" />
                                            هذا المستوى مكثف جداً! قد تحتاج لتمديد المدة الزمنية.
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Verses Equivalent */}
                            <div className="mt-6 pt-4 border-t border-border/50">
                                <p className="text-center text-text-muted text-sm">
                                    يعادل تقريباً <span className="font-bold text-emerald">{Math.ceil(dailyHifz * 15)}</span> آية يومياً
                                </p>
                            </div>
                        </motion.div>

                        {/* Review Strategy Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-surface rounded-2xl p-6 border border-border shadow-soft"
                        >
                            <h3 className="text-lg font-bold text-emerald mb-4 flex items-center gap-2">
                                <RotateCcw size={20} />
                                استراتيجية المراجعة
                            </h3>

                            <div className="bg-emerald/5 rounded-xl p-4 mb-4">
                                <p className="text-sm text-text-muted">
                                    القاعدة الذهبية: راجع <span className="font-bold text-gold">{REVIEW_RATIO}</span> صفحة لكل صفحة جديدة
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gold/10 rounded-xl border border-gold/20">
                                <span className="text-text-muted">المراجعة اليومية المطلوبة</span>
                                <span className="text-2xl font-bold text-gold">
                                    {dailyReview.toFixed(1)} صفحة
                                </span>
                            </div>
                        </motion.div>

                        {/* Statistics Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-surface rounded-2xl p-6 border border-border shadow-soft"
                        >
                            <h3 className="text-lg font-bold text-emerald mb-4 flex items-center gap-2">
                                <Calculator size={20} />
                                ملخص الحسابات
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-text-muted">إجمالي الأيام</span>
                                    <span className="font-bold text-emerald">{totalDays} يوم</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-text-muted">أيام الحفظ الفعلية</span>
                                    <span className="font-bold text-emerald">{activeDays} يوم</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-text-muted">أيام العطلة</span>
                                    <span className="font-bold text-gold">{totalDays - activeDays} يوم</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-text-muted">الصفحات المتبقية</span>
                                    <span className="font-bold text-emerald">{remainingPages} صفحة</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Motivational Tip */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gradient-to-l from-emerald to-emerald-deep rounded-2xl p-6 text-white shadow-elevated"
                        >
                            <p className="text-lg font-medium text-center">
                                &ldquo;خير ما تُعطى هو القرآن، وخير ما تَبقى هو الحفظ&rdquo;
                            </p>
                            <p className="text-white/60 text-sm text-center mt-2">
                                الثبات على القليل خير من الانقطاع عن الكثير
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
