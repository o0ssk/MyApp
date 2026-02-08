"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Play } from "lucide-react";
import { useAuth, useDashboardRoute } from "@/hooks/useAuth";
import { staggerContainer, fadeUp, buttonMotion, scaleUp } from "@/lib/motion";

export default function Hero() {
    const { user, isLoading } = useAuth();
    const dashboardRoute = useDashboardRoute();

    const handleCTAClick = () => {
        if (user) {
            window.location.href = dashboardRoute;
        } else {
            window.location.href = "/login";
        }
    };

    const scrollToFeatures = () => {
        const element = document.querySelector("#features");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        >
            {/* Background Ornaments */}
            <div className="ornament-pattern-corner top-0 right-0 opacity-5" />
            <div className="ornament-pattern-corner bottom-0 left-0 rotate-180 opacity-5" />

            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-sand via-sand to-surface dark:from-background dark:via-background dark:to-background" />

            <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Text Content */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="text-center lg:text-right"
                    >
                        {/* Badge */}
                        <motion.div variants={fadeUp} className="inline-block mb-6">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald/10 text-emerald rounded-full text-sm font-medium">
                                <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                                منصة حلقات القرآن الكريم
                            </span>
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1
                            variants={fadeUp}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-emerald-deep leading-tight mb-6"
                        >
                            منصتكم المتكاملة
                            <br />
                            <span className="text-emerald">لحفظ كتاب الله</span>
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            variants={fadeUp}
                            className="text-lg md:text-xl text-text-muted max-w-xl mx-auto lg:mx-0 mb-8"
                        >
                            نظام متكامل لإدارة حلقات التحفيظ، تتبع تقدم الطلاب، والتواصل الفعال
                            بين المعلم والطلاب في بيئة رقمية آمنة وسهلة الاستخدام.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <motion.button
                                variants={buttonMotion}
                                initial="rest"
                                whileHover="hover"
                                whileTap="tap"
                                onClick={handleCTAClick}
                                disabled={isLoading}
                                className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4"
                            >
                                ابدأ الآن
                                <ArrowLeft size={20} />
                            </motion.button>

                            <motion.button
                                variants={buttonMotion}
                                initial="rest"
                                whileHover="hover"
                                whileTap="tap"
                                onClick={scrollToFeatures}
                                className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4"
                            >
                                <Play size={18} />
                                شاهد المميزات
                            </motion.button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-wrap gap-8 justify-center lg:justify-start mt-12"
                        >
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald">+500</div>
                                <div className="text-sm text-text-muted">حلقة نشطة</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald">+5,000</div>
                                <div className="text-sm text-text-muted">طالب مسجل</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald">+200</div>
                                <div className="text-sm text-text-muted">معلم متميز</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Product Preview */}
                    <motion.div
                        variants={scaleUp}
                        initial="hidden"
                        animate="visible"
                        className="relative"
                    >
                        <div className="relative">
                            {/* Main Preview Card */}
                            <div className="bg-surface dark:bg-zinc-900 rounded-3xl shadow-elevated p-6 border border-border">
                                {/* Mock Dashboard Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src="/logo.png"
                                            alt="حلقتي"
                                            width={40}
                                            height={40}
                                            priority
                                            className="h-10 w-10 rounded-xl"
                                        />
                                        <div>
                                            <div className="font-bold text-emerald-deep dark:text-emerald-400">لوحة التحكم</div>
                                            <div className="text-xs text-text-muted">مرحباً بك</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gold" />
                                        <div className="w-3 h-3 rounded-full bg-emerald/30" />
                                        <div className="w-3 h-3 rounded-full bg-emerald/20" />
                                    </div>
                                </div>

                                {/* Progress Cards */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-sand dark:bg-zinc-800 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-emerald dark:text-emerald-400">٢٤</div>
                                        <div className="text-xs text-text-muted">صفحة محفوظة</div>
                                        <div className="mt-2 h-2 bg-emerald/10 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-emerald rounded-full" />
                                        </div>
                                    </div>
                                    <div className="bg-sand dark:bg-zinc-800 rounded-xl p-4">
                                        <div className="text-2xl font-bold text-gold">٩٥%</div>
                                        <div className="text-xs text-text-muted">نسبة الإتقان</div>
                                        <div className="mt-2 h-2 bg-gold/10 rounded-full overflow-hidden">
                                            <div className="h-full w-[95%] bg-gold rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-sand dark:bg-zinc-800 rounded-xl p-4">
                                    <div className="text-sm font-medium text-emerald-deep dark:text-emerald-400 mb-3">آخر النشاطات</div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald/10 rounded-lg flex items-center justify-center">
                                                <span className="text-emerald text-xs">✓</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium dark:text-zinc-200">سورة البقرة - صفحة ٥</div>
                                                <div className="text-xs text-text-muted">منذ ساعتين</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center">
                                                <span className="text-gold text-xs">★</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">تم الحصول على شارة جديدة</div>
                                                <div className="text-xs text-text-muted">أمس</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute -top-4 -left-4 bg-surface rounded-xl shadow-soft p-3 border border-border"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                                        <span className="text-gold">🏆</span>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium">أحسنت!</div>
                                        <div className="text-xs text-text-muted">المركز الأول</div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{
                                    y: [0, 10, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.5,
                                }}
                                className="absolute -bottom-4 -right-4 bg-surface rounded-xl shadow-soft p-3 border border-border"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-emerald/10 rounded-full flex items-center justify-center">
                                        <span className="text-emerald">📖</span>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium">جلسة جديدة</div>
                                        <div className="text-xs text-text-muted">الآن</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
