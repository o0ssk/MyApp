"use client";

import { motion } from "framer-motion";
import { UserPlus, Users, TrendingUp } from "lucide-react";
import { staggerContainer, fadeUp, viewportConfig } from "@/lib/motion";

const steps = [
    {
        icon: UserPlus,
        number: "١",
        title: "سجّل حسابك",
        description: "أنشئ حسابك كمعلم أو طالب في ثوانٍ معدودة",
        color: "emerald",
    },
    {
        icon: Users,
        number: "٢",
        title: "انضم أو أنشئ حلقة",
        description: "انضم لحلقة موجودة برمز الدعوة أو أنشئ حلقتك الخاصة",
        color: "gold",
    },
    {
        icon: TrendingUp,
        number: "٣",
        title: "تابع وتقدم",
        description: "سجّل حفظك يومياً وتابع تقدمك نحو إتمام الحفظ",
        color: "emerald",
    },
];

export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="section-padding bg-sand relative overflow-hidden"
        >
            <div className="max-w-7xl mx-auto">
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
                        className="inline-block px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-medium mb-4"
                    >
                        كيف نعمل
                    </motion.span>
                    <motion.h2
                        variants={fadeUp}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-deep mb-4"
                    >
                        ثلاث خطوات للبدء
                    </motion.h2>
                    <motion.p
                        variants={fadeUp}
                        className="text-lg text-text-muted max-w-2xl mx-auto"
                    >
                        ابدأ رحلتك مع حلقتي في خطوات بسيطة وسهلة
                    </motion.p>
                </motion.div>

                {/* Steps */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportConfig}
                    variants={staggerContainer}
                    className="relative"
                >
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-l from-emerald/20 via-gold/40 to-emerald/20 -translate-y-1/2" />

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                variants={fadeUp}
                                className="relative"
                            >
                                <div className="card text-center relative z-10">
                                    {/* Step Number Badge */}
                                    <div className="absolute -top-4 right-1/2 translate-x-1/2">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${step.color === "gold" ? "bg-gold" : "bg-emerald"
                                                }`}
                                        >
                                            {step.number}
                                        </div>
                                    </div>

                                    {/* Icon */}
                                    <div
                                        className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 mt-4 ${step.color === "gold"
                                            ? "bg-gold/10"
                                            : "bg-emerald/10"
                                            }`}
                                    >
                                        <step.icon
                                            className={`w-8 h-8 ${step.color === "gold" ? "text-gold" : "text-emerald"
                                                }`}
                                        />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-emerald-deep mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-text-muted">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
