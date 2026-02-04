"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, ClipboardCheck, Plus, BookOpen, TrendingUp } from "lucide-react";
import { useSheikhCircles, usePendingLogs } from "@/lib/hooks/useSheikh";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { staggerContainer, fadeUp, listItem } from "@/lib/motion";

export default function SheikhDashboardPage() {
    const { circles, isLoading: circlesLoading } = useSheikhCircles();
    const circleIds = useMemo(() => circles.map((c) => c.id), [circles]);
    const { logs: pendingLogs, isLoading: logsLoading } = usePendingLogs(circleIds);

    const stats = [
        {
            label: "الحلقات",
            value: circles.length,
            icon: Users,
            color: "text-emerald",
            bg: "bg-emerald/10",
            href: "/sheikh/circles",
        },
        {
            label: "بانتظار المراجعة",
            value: pendingLogs.length,
            icon: ClipboardCheck,
            color: "text-gold",
            bg: "bg-gold/10",
            href: "/sheikh/approvals",
        },
    ];

    const isLoading = circlesLoading || logsLoading;

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-8"
            >
                <h1 className="text-2xl font-bold text-emerald-deep mb-2">
                    لوحة تحكم الشيخ
                </h1>
                <p className="text-text-muted">أهلاً بك، إدارة حلقاتك وطلابك</p>
            </motion.div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Right Side) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {stats.map((stat) => (
                            <motion.div key={stat.label} variants={listItem}>
                                <Link href={stat.href}>
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardContent className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                                <stat.icon size={24} className={stat.color} />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-emerald-deep">
                                                    {isLoading ? "..." : stat.value}
                                                </p>
                                                <p className="text-sm text-text-muted">{stat.label}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div variants={fadeUp} initial="hidden" animate="visible">
                        <h2 className="text-lg font-bold text-emerald-deep mb-4">إجراءات سريعة</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/sheikh/circles">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-emerald/10">
                                            <Plus size={24} className="text-emerald" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-deep">إنشاء حلقة جديدة</p>
                                            <p className="text-sm text-text-muted">ابدأ حلقة قرآنية جديدة</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/sheikh/approvals">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-gold/10">
                                            <ClipboardCheck size={24} className="text-gold" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-deep">مراجعة السجلات</p>
                                            <p className="text-sm text-text-muted">
                                                {pendingLogs.length > 0
                                                    ? `${pendingLogs.length} سجل بانتظار المراجعة`
                                                    : "لا توجد سجلات معلقة"}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Recent Circles */}
                    {circles.length > 0 && (
                        <motion.div variants={fadeUp} initial="hidden" animate="visible">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-emerald-deep">حلقاتي</h2>
                                <Link href="/sheikh/circles" className="text-gold text-sm hover:underline">
                                    عرض الكل
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {circles.slice(0, 3).map((circle) => (
                                    <Link key={circle.id} href={`/sheikh/circles?id=${circle.id}`}>
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                            <CardContent className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                                                        <BookOpen size={20} className="text-emerald" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-emerald-deep">{circle.name}</p>
                                                        <p className="text-xs text-text-muted">
                                                            رمز الدعوة: {circle.inviteCode}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar (Left Side) - Leaderboard */}
                <div className="lg:col-span-1">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="sticky top-6"
                    >
                        <Leaderboard />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
