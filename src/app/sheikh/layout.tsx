"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AuthGuard } from "@/lib/auth/guards";
import { ToastProvider } from "@/components/ui/Toast";
import { Sidebar } from "@/components/sheikh/Sidebar";
import { ModeToggleSimple } from "@/components/mode-toggle";
import "@/styles/tokens.css";

export default function SheikhLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard requireAuth requireProfile allowedRoles={["sheikh"]}>
            <ToastProvider>
                <div className="min-h-screen bg-transparent flex">
                    {/* Desktop Sidebar */}
                    <Sidebar className="hidden lg:flex fixed right-0 top-0 h-screen w-64 z-40 shadow-sm" />

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col lg:mr-64 relative z-0">
                        {/* Mobile Header */}
                        <MobileHeader />

                        {/* Page Content */}
                        <main className="flex-1 pb-20 lg:pb-6">
                            {children}
                        </main>

                        {/* Mobile Bottom Nav (Optional - keeping generic list for now if needed, or removing if Sidebar Drawer is the primary way. The user requested Sidebar Drawer, but Bottom Nav is also mobile friendly. I will keep Bottom Nav for quick access as per previous design, but Sidebar Drawer gives full access.) */}
                        <MobileBottomNav />
                    </div>
                </div>
            </ToastProvider>
        </AuthGuard>
    );
}

function MobileHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <header className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="px-4 py-3 flex items-center justify-between">
                    <Link href="/sheikh/dashboard" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                            <img
                                src="/logo.png"
                                alt="حلقتي"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <span className="font-bold text-emerald-deep dark:text-emerald">حلقتي</span>
                            <span className="text-xs text-gold block">لوحة الشيخ</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        <ModeToggleSimple />

                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
                            aria-label="القائمة"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-50">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 h-full w-72 shadow-2xl"
                        >
                            <Sidebar onClose={() => setIsMenuOpen(false)} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

import { LayoutDashboard, Users, ClipboardCheck, GraduationCap } from "lucide-react";
import { usePathname } from "next/navigation";

function MobileBottomNav() {
    const pathname = usePathname();
    // Simplified bottom nav items
    const mainNavItems = [
        { href: "/sheikh/dashboard", label: "الرئيسية", icon: LayoutDashboard },
        { href: "/sheikh/circles", label: "الحلقات", icon: Users },
        { href: "/sheikh/approvals", label: "المراجعات", icon: ClipboardCheck },
        { href: "/sheikh/students", label: "الطلاب", icon: GraduationCap },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border safe-area-bottom">
            <div className="flex items-center justify-around py-2">
                {mainNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1 px-3 py-2 min-w-[64px]"
                        >
                            <motion.div
                                animate={{ scale: isActive ? 1.1 : 1 }}
                                className={`p-2 rounded-xl transition-colors ${isActive
                                    ? "bg-emerald/10 text-emerald"
                                    : "text-text-muted"
                                    }`}
                            >
                                <Icon size={20} />
                            </motion.div>
                            <span
                                className={`text-[10px] font-medium ${isActive ? "text-emerald" : "text-text-muted"
                                    }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
