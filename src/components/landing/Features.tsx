"use client";

import { motion } from "framer-motion";
import { ClipboardList, MessageSquare, Trophy, BarChart3 } from "lucide-react";
import { staggerContainer, fadeUp, cardHover, viewportConfig } from "@/lib/motion";

const features = [
    {
        icon: ClipboardList,
        title: "تتبع الحفظ والمراجعة",
        description:
            "سجل يومي لكل طالب يشمل الحفظ الجديد والمراجعة مع تقييم دقيق من المعلم.",
    },
    {
        icon: MessageSquare,
        title: "إعلانات ورسائل",
        description:
            "تواصل مباشر بين المعلم والطلاب عبر الإعلانات والرسائل الخاصة.",
    },
    {
        icon: Trophy,
        title: "لوحة الصدارة والإنجازات",
        description:
            "نظام نقاط وشارات تحفيزية مع لوحة صدارة تشجع على المنافسة الإيجابية.",
    },
    {
        icon: BarChart3,
        title: "تحليلات وإحصائيات",
        description:
            "رسوم بيانية تفاعلية توضح تقدم الطالب ومستوى الأداء بشكل مرئي.",
    },
];

export default function Features() {
    return (
        <section
            id="features"
            className="section-padding bg-surface relative overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="ornament-pattern absolute inset-0" />

            <div className="relative max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportConfig}
                    variants={staggerContainer}
                    className="text-center mb-16"
                >
                    <motion.span
                        variants={fadeUp}
                        className="inline-block px-4 py-2 bg-emerald/10 text-emerald rounded-full text-sm font-medium mb-4"
                    >
                        المميزات
                    </motion.span>
                    <motion.h2
                        variants={fadeUp}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-deep mb-4"
                    >
                        كل ما تحتاجه في مكان واحد
                    </motion.h2>
                    <motion.p
                        variants={fadeUp}
                        className="text-lg text-text-muted max-w-2xl mx-auto"
                    >
                        أدوات متكاملة لإدارة حلقتك بكفاءة عالية وتجربة مميزة
                    </motion.p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportConfig}
                    variants={staggerContainer}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={fadeUp}
                        >
                            <motion.div
                                variants={cardHover}
                                initial="rest"
                                whileHover="hover"
                                className="card h-full cursor-default group"
                            >
                                {/* Icon */}
                                <div className="w-14 h-14 bg-emerald/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-emerald/15 transition-colors duration-300">
                                    <feature.icon className="w-7 h-7 text-emerald" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-emerald-deep mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-text-muted leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
