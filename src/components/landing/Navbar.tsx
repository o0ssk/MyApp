"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useAuth, useDashboardRoute } from "@/hooks/useAuth";
import { buttonMotion } from "@/lib/motion";
import { LandingCenterNav } from "@/components/layout/LandingCenterNav";
import { ModeToggle } from "@/components/mode-toggle";

const navLinks = [
    { label: "الرئيسية", href: "#hero" },
    { label: "المميزات", href: "#features" },
    { label: "كيف نعمل", href: "#how-it-works" },
    { label: "تواصل", href: "/contact" },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, isLoading } = useAuth();
    const dashboardRoute = useDashboardRoute();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
            setIsMobileMenuOpen(false);
        }
    };

    const handleCTAClick = () => {
        if (user) {
            window.location.href = dashboardRoute;
        } else {
            window.location.href = "/login";
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "glass py-3 shadow-soft dark:bg-black/80"
                : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/logo.png"
                            alt="حلقتي"
                            className="w-10 h-10 rounded-xl object-cover"
                        />
                        <span className="text-xl font-bold text-emerald dark:text-emerald-400">حلقتي</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-center">
                        <LandingCenterNav />
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <ModeToggle />
                        <Link
                            href="/login"
                            className="btn-secondary text-sm"
                        >
                            تسجيل الدخول
                        </Link>
                        <motion.button
                            variants={buttonMotion}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={handleCTAClick}
                            disabled={isLoading}
                            className="btn-primary text-sm"
                        >
                            ابدأ الآن
                        </motion.button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-emerald"
                        aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden mt-4 py-4 border-t border-border"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href)}
                                    className="text-text-muted hover:text-emerald transition-colors duration-200 font-medium py-2"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <hr className="border-border" />
                            <Link
                                href="/login"
                                className="btn-secondary text-center"
                            >
                                تسجيل الدخول
                            </Link>
                            <button
                                onClick={handleCTAClick}
                                disabled={isLoading}
                                className="btn-primary text-center"
                            >
                                ابدأ الآن
                            </button>
                            {/* Theme Toggle for Mobile */}
                            <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
                                <span className="text-sm text-text-muted">الوضع الليلي</span>
                                <ModeToggle />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
}