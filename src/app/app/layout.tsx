"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, BookOpen, MessageSquare, User } from "lucide-react";
import { AuthGuard } from "@/lib/auth/guards";
import { ToastProvider } from "@/components/ui/Toast";

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { href: "/app/dashboard", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/app/log", label: "سجلي", icon: BookOpen },
    { href: "/app/messages", label: "الرسائل", icon: MessageSquare },
    { href: "/app/profile", label: "حسابي", icon: User },
];

export default function StudentAppLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard requireAuth requireProfile allowedRoles={["student"]}>
            <ToastProvider>
                <div className="min-h-screen bg-sand flex flex-col">
                    {/* Top Bar */}
                    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border">
                        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                            <Link href="/app/dashboard" className="flex items-center gap-2">
                                <img
                                    src="/logo.png"
                                    alt="حلقتي"
                                    className="w-9 h-9 rounded-lg object-cover"
                                />
                                <span className="font-bold text-emerald-deep text-lg">حلقتي</span>
                            </Link>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 pb-20">
                        {children}
                    </main>

                    {/* Bottom Navigation */}
                    <BottomNav />
                </div>
            </ToastProvider>
        </AuthGuard>
    );
}

function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border safe-area-bottom">
            <div className="max-w-md mx-auto px-4">
                <div className="flex items-center justify-around py-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center gap-1 px-4 py-2 min-w-[72px]"
                            >
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1 : 0.95,
                                        y: isActive ? -2 : 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className={`p-2 rounded-xl transition-colors ${isActive
                                        ? "bg-gold/10 text-gold"
                                        : "text-text-muted hover:text-emerald"
                                        }`}
                                >
                                    <Icon size={22} />
                                </motion.div>
                                <span
                                    className={`text-xs font-medium transition-colors ${isActive ? "text-gold" : "text-text-muted"
                                        }`}
                                >
                                    {item.label}
                                </span>
                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute -top-0.5 w-8 h-1 bg-gold rounded-full"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
