"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth, useDashboardRoute } from "@/hooks/useAuth";
import { staggerContainer, fadeUp, buttonMotion, viewportConfig } from "@/lib/motion";

export default function CTABanner() {
    const { user, isLoading } = useAuth();
    const dashboardRoute = useDashboardRoute();

    const handleCTAClick = () => {
        if (user) {
            window.location.href = dashboardRoute;
        } else {
            window.location.href = "/login";
        }
    };

    return (
        <section className="section-padding bg-emerald-deep relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="ornament-pattern h-full w-full" />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep via-emerald to-emerald-deep opacity-80" />

            <div className="relative max-w-4xl mx-auto text-center">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportConfig}
                    variants={staggerContainer}
                >
                    {/* Badge */}
                    <motion.div variants={fadeUp} className="mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white/90 rounded-full text-sm font-medium backdrop-blur-sm">
                            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                            ابدأ مجاناً اليوم
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h2
                        variants={fadeUp}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                    >
                        هل أنت مستعد لبدء رحلتك
                        <br />
                        <span className="text-gold">في حفظ كتاب الله؟</span>
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        variants={fadeUp}
                        className="text-lg text-white/80 max-w-2xl mx-auto mb-10"
                    >
                        انضم إلى آلاف الطلاب والمعلمين الذين يستخدمون حلقتي لتحقيق أهدافهم في
                        حفظ القرآن الكريم
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={fadeUp}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <motion.button
                            variants={buttonMotion}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={handleCTAClick}
                            disabled={isLoading}
                            className="btn-gold flex items-center justify-center gap-2 text-lg"
                        >
                            ابدأ رحلتك الآن
                            <ArrowLeft size={20} />
                        </motion.button>

                        <Link href="/login">
                            <motion.span
                                variants={buttonMotion}
                                initial="rest"
                                whileHover="hover"
                                whileTap="tap"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-medium rounded-xl border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
                            >
                                تسجيل الدخول
                            </motion.span>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
