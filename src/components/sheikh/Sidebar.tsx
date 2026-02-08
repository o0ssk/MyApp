"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ClipboardCheck,
    GraduationCap,
    BarChart3,
    Settings,
    X,
    CalendarCheck,
    MessageCircle,
} from "lucide-react";
import { ModeToggleSimple } from "@/components/mode-toggle";

interface SidebarProps {
    className?: string;
    onClose?: () => void;
}

const navItems = [
    { href: "/sheikh/dashboard", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/sheikh/circles", label: "الحلقات", icon: Users },
    { href: "/sheikh/attendance", label: "التحضير", icon: CalendarCheck },
    { href: "/sheikh/approvals", label: "المراجعات", icon: ClipboardCheck },
    { href: "/sheikh/students", label: "الطلاب", icon: GraduationCap },
    { href: "/sheikh/messages", label: "الرسائل", icon: MessageCircle },
    { href: "/sheikh/reports", label: "التقارير", icon: BarChart3 },
    { href: "/sheikh/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar({ className, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={`bg-surface border-l border-border flex flex-col h-full ${className}`}>
            {/* Header / Logo */}
            <div className="p-6 border-b border-border flex items-center justify-between">
                <Link href="/sheikh/dashboard" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden">
                        <img
                            src="/logo.png"
                            alt="حلقتي"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <span className="font-bold text-emerald-deep text-lg block">حلقتي</span>
                        <span className="text-xs text-gold">لوحة الشيخ</span>
                    </div>
                </Link>

                {/* Close Button (Mobile Only) */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-text-muted hover:bg-sand rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? "bg-emerald text-white shadow-md shadow-emerald/10"
                                : "text-text hover:bg-sand"
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border mt-auto">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-muted">المظهر</span>
                    <ModeToggleSimple />
                </div>
                <div className="text-xs text-text-muted text-center">
                    حلقتي © {new Date().getFullYear()}
                </div>
            </div>
        </aside>
    );
}
