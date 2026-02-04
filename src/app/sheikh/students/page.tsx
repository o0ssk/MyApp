"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    GraduationCap,
    Search,
    BookOpen,
    Calendar,
    ChevronLeft,
    Users,
    Filter,
} from "lucide-react";

import { useSheikhCircles } from "@/lib/hooks/useSheikh";
import { useSheikhStudents, Student } from "../../../lib/hooks/useSheikhStudents";
import { useCircleStats } from "@/lib/hooks/useReports";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { StudentBadge } from "@/components/ui/StudentBadge";
import { staggerContainer, fadeUp, listItem } from "@/lib/motion";

export default function StudentsPage() {
    const { circles, isLoading: circlesLoading } = useSheikhCircles();
    const circleIds = useMemo(() => circles.map((c) => c.id), [circles]);
    const { students, isLoading: studentsLoading, error } = useSheikhStudents(circleIds);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);

    const isLoading = circlesLoading || studentsLoading;

    // Filter students
    const filteredStudents = useMemo(() => {
        let result = students;

        // Filter by circle
        if (selectedCircleId) {
            result = result.filter((s) => s.circleId === selectedCircleId);
        }

        // Filter by search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((s) => s.odei.toLowerCase().includes(q));
        }

        return result;
    }, [students, selectedCircleId, searchQuery]);

    // Stats
    const activeCount = students.filter((s) => s.isActive).length;
    const inactiveCount = students.length - activeCount;

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6"
            >
                <h1 className="text-2xl font-bold text-emerald-deep">الطلاب</h1>
                <p className="text-text-muted">
                    {students.length > 0
                        ? `${students.length} طالب - ${activeCount} نشط`
                        : "إدارة ومتابعة طلابك"}
                </p>
            </motion.div>

            {/* Filters */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6 space-y-4"
            >
                {/* Search */}
                <div className="relative">
                    <Search
                        size={20}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث بالاسم..."
                        className="w-full pr-12 pl-4 py-3 bg-surface border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                </div>

                {/* Circle Tabs */}
                {circles.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCircleId(null)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${selectedCircleId === null
                                ? "bg-emerald text-white"
                                : "bg-surface border border-border text-text hover:bg-sand"
                                }`}
                        >
                            الكل ({students.length})
                        </button>
                        {circles.map((circle) => {
                            const count = students.filter((s) => s.circleId === circle.id).length;
                            return (
                                <button
                                    key={circle.id}
                                    onClick={() => setSelectedCircleId(circle.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${selectedCircleId === circle.id
                                        ? "bg-emerald text-white"
                                        : "bg-surface border border-border text-text hover:bg-sand"
                                        }`}
                                >
                                    {circle.name} ({count})
                                </button>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Loading */}
            {isLoading && (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="h-20" />
                        </Card>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && !isLoading && (
                <Card>
                    <EmptyState
                        icon={<GraduationCap size={40} />}
                        title="خطأ في التحميل"
                        description={error}
                    />
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && students.length === 0 && (
                <Card>
                    <EmptyState
                        icon={<GraduationCap size={40} />}
                        title="لا يوجد طلاب بعد"
                        description="سيظهر الطلاب هنا بمجرد قبول طلبات الانضمام للحلقات"
                    />
                </Card>
            )}

            {/* No Results */}
            {!isLoading && !error && students.length > 0 && filteredStudents.length === 0 && (
                <Card>
                    <EmptyState
                        icon={<Search size={40} />}
                        title="لا توجد نتائج"
                        description="جرب تغيير معايير البحث"
                    />
                </Card>
            )}

            {/* Students List */}
            {!isLoading && !error && filteredStudents.length > 0 && (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                >
                    {/* Mobile/Tablet View: Cards */}
                    <div className="lg:hidden space-y-3">
                        {filteredStudents.map((student) => (
                            <motion.div key={student.id} variants={listItem}>
                                <StudentCard student={student} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden lg:block bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-sand/50 text-text-muted font-medium border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-right">الطالب</th>
                                        <th className="px-6 py-4 text-right">الحلقة</th>
                                        <th className="px-6 py-4 text-right">الصفحات المعتمدة</th>
                                        <th className="px-6 py-4 text-right">آخر نشاط</th>
                                        <th className="px-6 py-4 text-right">الحالة</th>
                                        <th className="px-6 py-4 text-left">الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredStudents.map((student) => {
                                        const statusColor = student.isActive
                                            ? "bg-emerald"
                                            : "bg-red-500";
                                        const lastLogText = student.lastLogDate
                                            ? student.lastLogDate.toLocaleDateString("ar-SA")
                                            : "لا يوجد";

                                        return (
                                            <tr
                                                key={student.id}
                                                className="group hover:bg-sand/30 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-10 h-10 rounded-full border border-border overflow-hidden bg-sand">
                                                            <Avatar
                                                                src={student.avatar}
                                                                name={student.odei}
                                                                size="sm"
                                                                className="w-full h-full"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-emerald-deep">{student.odei}</span>
                                                            <StudentBadge badgeId={student.equippedBadge} size="sm" />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-text-muted">
                                                        <Users size={16} />
                                                        <span>{student.circleName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-text-muted">
                                                        <BookOpen size={16} />
                                                        <span>{student.totalApprovedPages} صفحة</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-text-muted">
                                                        <Calendar size={16} />
                                                        <span>{lastLogText}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
                                                        <span className="text-text-muted">
                                                            {student.isActive ? "نشط" : "غير نشط"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-left">
                                                    <Link
                                                        href={`/sheikh/students/${student.odeiUserId}`}
                                                        className="inline-flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-emerald hover:bg-emerald/5 transition-colors"
                                                    >
                                                        <span className="sr-only">التفاصيل</span>
                                                        <ChevronLeft size={20} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// Student Card Component
function StudentCard({ student }: { student: Student }) {
    // console.log removed


    const statusColor = student.isActive
        ? "bg-emerald"
        : "bg-red-500";

    // Format last log date
    const lastLogText = student.lastLogDate
        ? student.lastLogDate.toLocaleDateString("ar-SA")
        : "لا يوجد";

    return (
        <Link href={`/sheikh/students/${student.odeiUserId}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-emerald/10 overflow-hidden bg-sand">
                                <Avatar
                                    src={student.avatar}
                                    name={student.odei}
                                    size="md"
                                    className="w-full h-full"
                                />
                            </div>
                            {/* Status dot */}
                            <div
                                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface ${statusColor}`}
                            />
                        </div>

                        {/* Info */}
                        <div>
                            <h3 className="font-bold text-emerald-deep flex items-center gap-1">
                                {student.odei}
                                <StudentBadge badgeId={student.equippedBadge} size="sm" />
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-text-muted">
                                <span className="flex items-center gap-1">
                                    <Users size={14} />
                                    {student.circleName}
                                </span>
                                <span className="flex items-center gap-1">
                                    <BookOpen size={14} />
                                    {student.totalApprovedPages} صفحة
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        <div className="text-left">
                            <p className="text-xs text-text-muted">آخر سجل</p>
                            <p className="text-sm font-medium text-emerald-deep">{lastLogText}</p>
                        </div>
                        <ChevronLeft size={20} className="text-text-muted" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
