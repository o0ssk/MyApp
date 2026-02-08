"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    History,
    CalendarCheck,
    Calendar,
    Store,
    MessageCircle,
    User,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Items
// ─────────────────────────────────────────────────────────────────────────────

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    gradient: string;
}

const navItems: NavItem[] = [
    {
        href: "/student",
        label: "الرئيسية",
        icon: Home,
        gradient: "linear-gradient(135deg, #0F3D2E 0%, #10b981 100%)",
    },
    {
        href: "/app/log",
        label: "سجلي",
        // Verified path for History
        icon: History,
        gradient: "linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)",
    },
    {
        href: "/student/attendance",
        label: "الحضور",
        icon: CalendarCheck,
        gradient: "linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)",
    },
    {
        href: "/student/planner",
        label: "المخطط",
        icon: Calendar,
        gradient: "linear-gradient(135deg, #80FF72 0%, #7EE8FA 100%)",
    },
    {
        href: "/student/store",
        label: "المتجر",
        icon: Store,
        gradient: "linear-gradient(135deg, #ffa9c6 0%, #f434e2 100%)",
    },
    {
        href: "/app/messages",
        label: "الرسائل",
        icon: MessageCircle,
        gradient: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
    },
    {
        href: "/app/profile",
        label: "حسابي",
        icon: User,
        gradient: "linear-gradient(135deg, #0F3D2E 0%, #10b981 100%)",
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// GPU ACCELERATED Gradient Nav (Layered Opacity)
// ─────────────────────────────────────────────────────────────────────────────

export function GradientNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pointer-events-none border-none outline-none ring-0 z-[9999]"
        >
            <div className="pointer-events-auto">
                <div
                    className="flex items-center justify-start md:justify-center gap-2 px-3 py-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg border border-border overflow-x-auto max-w-[95vw]"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {navItems.map((item) => {
                        const normalize = (p: string) => p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p;
                        const currentPath = normalize(pathname || "");
                        const itemPath = normalize(item.href);

                        const isActive =
                            itemPath === "/student"
                                ? currentPath === "/student"
                                : currentPath.startsWith(itemPath);

                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative group shrink-0"
                            >
                                <div
                                    className={cn(
                                        // Base Container Styles
                                        "h-11 rounded-xl flex items-center justify-center gap-2 overflow-hidden relative cursor-pointer",
                                        // Width Transition (GPU Safe-ish)
                                        "transition-[width] duration-300 ease-in-out",
                                        isActive
                                            ? "w-[115px] shadow-lg ring-1 ring-white/20"
                                            : "w-[45px] hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    )}
                                >
                                    {/* BACKGROUND LAYER (Absolute, Fade In/Out) - pointer-events-none to allow clicks through */}
                                    <div
                                        className={cn(
                                            "absolute inset-0 transition-opacity duration-300 ease-in-out pointer-events-none",
                                            isActive ? "opacity-100" : "opacity-0"
                                        )}
                                        style={{ background: item.gradient }}
                                    />

                                    {/* CONTENT LAYER (Relative, on top) */}
                                    <div className="relative z-10 flex items-center justify-center w-full h-full gap-2 px-2">
                                        <Icon
                                            size={20}
                                            className={cn(
                                                "flex-shrink-0 transition-colors duration-300",
                                                isActive ? "text-white" : "text-zinc-500 dark:text-zinc-400"
                                            )}
                                        />

                                        {/* Label */}
                                        <span
                                            className={cn(
                                                "text-xs font-bold whitespace-nowrap overflow-hidden",
                                                "transition-opacity duration-300 delay-75",
                                                isActive
                                                    ? "opacity-100 text-white"
                                                    : "opacity-0 w-0"
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
