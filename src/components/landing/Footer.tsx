"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

const footerLinks = {
    main: [
        { label: "الرئيسية", href: "/" },
        { label: "المميزات", href: "/#features" },
        { label: "كيف نعمل", href: "/#how-it-works" },
    ],
    support: [
        { label: "تواصل معنا", href: "/contact" },
        { label: "تسجيل الدخول", href: "/login" },
    ],
};

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-emerald-deep text-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
                <div className="grid md:grid-cols-4 gap-8 md:gap-12">
                    {/* Brand Column */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <img
                                src="/logo.png"
                                alt="حلقتي"
                                className="w-10 h-10 rounded-xl object-cover"
                            />
                            <span className="text-xl font-bold">حلقتي</span>
                        </div>
                        <p className="text-white/70 leading-relaxed max-w-md">
                            منصة متكاملة لإدارة حلقات تحفيظ القرآن الكريم. نسعى لتسهيل رحلة
                            الحفظ للطلاب والمعلمين من خلال أدوات ذكية وتجربة مستخدم مميزة.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">روابط سريعة</h4>
                        <ul className="space-y-3">
                            {footerLinks.main.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-white/70 hover:text-white transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">الدعم</h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-white/70 hover:text-white transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-white/50 text-sm">
                            © {currentYear} حلقتي. جميع الحقوق محفوظة.
                        </p>
                        <p className="text-white/50 text-sm flex items-center gap-1">
                            صُنع بـ <Heart size={14} className="text-gold fill-gold" /> لخدمة
                            كتاب الله
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
