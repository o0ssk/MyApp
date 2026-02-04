"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { AuthGuard } from "@/lib/auth/guards";
import { ModeToggleSimple } from "@/components/mode-toggle";
import { GradientNav } from "@/components/ui/gradient-nav";

export default function StudentLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard requireAuth requireProfile allowedRoles={["student"]}>
            <div className="min-h-screen bg-transparent flex flex-col">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
                    <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                        <Link href="/student" className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="حلقتي"
                                className="w-9 h-9 rounded-lg object-cover"
                            />
                            <span className="font-bold text-emerald-deep dark:text-emerald text-lg">حلقتي</span>
                        </Link>

                        {/* Theme Toggle */}
                        <ModeToggleSimple />
                    </div>
                </header>

                {/* Main Content - pb-28 to make room for floating nav */}
                <main className="flex-1 pb-28">
                    {children}
                </main>

                {/* Gradient Bottom Navigation (Mobile Only) */}
                <GradientNav />
            </div>
        </AuthGuard>
    );
}
