"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, User, MessageSquare, Send, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { staggerContainer, fadeUp, buttonMotion } from "@/lib/motion";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Placeholder: In production, this would send to a backend
        console.log("Contact form submitted:", formData);

        // Simulate submission delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsSubmitted(true);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-sand">
            {/* Background Pattern */}
            <div className="ornament-pattern fixed inset-0 pointer-events-none" />

            {/* Header */}
            <header className="relative bg-emerald-deep text-white py-8">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden">
                                <img
                                    src="/logo.png"
                                    alt="حلقتي"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold">حلقتي</span>
                        </Link>
                        <Link
                            href="/"
                            className="text-white/80 hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowRight size={16} />
                            الرئيسية
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="relative max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    {/* Title */}
                    <motion.div variants={fadeUp} className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-emerald-deep mb-4">
                            تواصل معنا
                        </h1>
                        <p className="text-lg text-text-muted max-w-2xl mx-auto">
                            نسعد بتواصلكم معنا. أرسل لنا رسالتك وسنرد عليك في أقرب وقت.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <motion.div variants={fadeUp} className="md:col-span-1 space-y-6">
                            <div className="card">
                                <h3 className="font-bold text-emerald-deep mb-4">معلومات التواصل</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-emerald/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-5 h-5 text-emerald" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-text-muted">البريد الإلكتروني</div>
                                            <div className="font-medium" dir="ltr">support@halqati.com</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h3 className="font-bold text-emerald-deep mb-4">ساعات العمل</h3>
                                <p className="text-text-muted">
                                    الأحد - الخميس
                                    <br />
                                    ٩ صباحاً - ٥ مساءً
                                </p>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div variants={fadeUp} className="md:col-span-2">
                            <div className="card">
                                {isSubmitted ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-emerald" />
                                        </div>
                                        <h3 className="text-xl font-bold text-emerald-deep mb-2">
                                            تم إرسال رسالتك بنجاح
                                        </h3>
                                        <p className="text-text-muted mb-6">
                                            شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.
                                        </p>
                                        <Link href="/" className="btn-primary inline-flex items-center gap-2">
                                            العودة للرئيسية
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Name Field */}
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-medium text-emerald-deep mb-2"
                                            >
                                                الاسم الكامل
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="أدخل اسمك"
                                                    required
                                                    className="w-full px-4 py-3 pr-11 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                                                />
                                                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                            </div>
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-medium text-emerald-deep mb-2"
                                            >
                                                البريد الإلكتروني
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="example@email.com"
                                                    required
                                                    className="w-full px-4 py-3 pr-11 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                                                    dir="ltr"
                                                />
                                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                            </div>
                                        </div>

                                        {/* Message Field */}
                                        <div>
                                            <label
                                                htmlFor="message"
                                                className="block text-sm font-medium text-emerald-deep mb-2"
                                            >
                                                رسالتك
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="اكتب رسالتك هنا..."
                                                    required
                                                    rows={5}
                                                    className="w-full px-4 py-3 pr-11 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all resize-none"
                                                />
                                                <MessageSquare className="absolute right-4 top-4 w-5 h-5 text-text-muted" />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <motion.button
                                            variants={buttonMotion}
                                            initial="rest"
                                            whileHover="hover"
                                            whileTap="tap"
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full btn-primary flex items-center justify-center gap-2 py-4"
                                        >
                                            {isLoading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    إرسال الرسالة
                                                    <Send size={18} />
                                                </>
                                            )}
                                        </motion.button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
