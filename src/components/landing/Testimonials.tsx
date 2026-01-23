"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { staggerContainer, fadeUp, viewportConfig } from "@/lib/motion";

const testimonials = [
    {
        id: 1,
        name: "الشيخ محمد العتيبي",
        role: "معلم قرآن - حلقة النور",
        content:
            "منصة حلقتي غيّرت طريقة إدارتي للحلقة بشكل كامل. أصبح تتبع تقدم الطلاب سهلاً جداً والتواصل معهم أكثر فعالية. أنصح كل معلم بتجربتها.",
        avatar: "م",
    },
    {
        id: 2,
        name: "أحمد الشمري",
        role: "طالب - المستوى المتقدم",
        content:
            "الشارات والنقاط تحفزني كثيراً على المواصلة. أحب رؤية تقدمي على لوحة الصدارة ومنافسة زملائي بشكل إيجابي. شكراً حلقتي!",
        avatar: "أ",
    },
    {
        id: 3,
        name: "خالد المطيري",
        role: "ولي أمر",
        content:
            "أستطيع الآن متابعة تقدم ابني في الحفظ بسهولة. التقارير واضحة ومفصلة وأتلقى إشعارات بكل جديد. منصة ممتازة!",
        avatar: "خ",
    },
];

export default function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    const scrollToIndex = (index: number) => {
        setActiveIndex(index);
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.offsetWidth * index;
            carouselRef.current.scrollTo({
                left: scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const next = () => {
        const newIndex = (activeIndex + 1) % testimonials.length;
        scrollToIndex(newIndex);
    };

    const prev = () => {
        const newIndex =
            activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;
        scrollToIndex(newIndex);
    };

    return (
        <section
            id="testimonials"
            className="section-padding bg-surface relative overflow-hidden"
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
                        className="inline-block px-4 py-2 bg-emerald/10 text-emerald rounded-full text-sm font-medium mb-4"
                    >
                        آراء المستخدمين
                    </motion.span>
                    <motion.h2
                        variants={fadeUp}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-deep mb-4"
                    >
                        ماذا يقولون عنّا
                    </motion.h2>
                    <motion.p
                        variants={fadeUp}
                        className="text-lg text-text-muted max-w-2xl mx-auto"
                    >
                        آراء حقيقية من معلمين وطلاب وأولياء أمور
                    </motion.p>
                </motion.div>

                {/* Desktop Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportConfig}
                    variants={staggerContainer}
                    className="hidden md:grid md:grid-cols-3 gap-6"
                >
                    {testimonials.map((testimonial, index) => (
                        <motion.div key={testimonial.id} variants={fadeUp}>
                            <TestimonialCard testimonial={testimonial} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Mobile Carousel */}
                <div className="md:hidden">
                    <div
                        ref={carouselRef}
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="flex-shrink-0 w-full snap-center"
                            >
                                <TestimonialCard testimonial={testimonial} />
                            </div>
                        ))}
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                            onClick={prev}
                            className="w-10 h-10 rounded-full bg-emerald/10 text-emerald flex items-center justify-center hover:bg-emerald/20 transition-colors"
                            aria-label="السابق"
                        >
                            <ChevronRight size={20} />
                        </button>

                        <div className="flex gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollToIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === index
                                        ? "w-6 bg-emerald"
                                        : "bg-emerald/30"
                                        }`}
                                    aria-label={`انتقل إلى الشهادة ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={next}
                            className="w-10 h-10 rounded-full bg-emerald/10 text-emerald flex items-center justify-center hover:bg-emerald/20 transition-colors"
                            aria-label="التالي"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TestimonialCard({
    testimonial,
}: {
    testimonial: (typeof testimonials)[0];
}) {
    return (
        <div className="card h-full relative">
            {/* Quote Icon */}
            <div className="absolute top-4 left-4 text-gold/20">
                <Quote size={40} />
            </div>

            {/* Content */}
            <p className="text-text-muted leading-relaxed mb-6 relative z-10">
                {testimonial.content}
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 mt-auto">
                <div className="w-12 h-12 bg-emerald/10 rounded-full flex items-center justify-center">
                    <span className="text-emerald font-bold text-lg">
                        {testimonial.avatar}
                    </span>
                </div>
                <div>
                    <div className="font-bold text-emerald-deep">{testimonial.name}</div>
                    <div className="text-sm text-text-muted">{testimonial.role}</div>
                </div>
            </div>
        </div>
    );
}
