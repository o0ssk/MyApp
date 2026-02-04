"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";

export function ModeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="p-2 rounded-xl bg-sand dark:bg-surface border border-border">
                <div className="w-5 h-5" />
            </button>
        );
    }

    const themes = [
        { name: "light", label: "فاتح", icon: Sun },
        { name: "dark", label: "داكن", icon: Moon },
        { name: "system", label: "تلقائي", icon: Monitor },
    ];

    const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

    return (
        <div className="relative">
            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-sand dark:bg-slate-800 border border-border hover:border-emerald/30 transition-all"
                aria-label="تغيير المظهر"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={resolvedTheme}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CurrentIcon className="w-5 h-5 text-gold" />
                    </motion.div>
                </AnimatePresence>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-2 z-50 bg-surface dark:bg-slate-800 rounded-xl border border-border shadow-lg overflow-hidden min-w-[140px]"
                        >
                            {themes.map(({ name, label, icon: Icon }) => (
                                <button
                                    key={name}
                                    onClick={() => {
                                        setTheme(name);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                                        ${theme === name
                                            ? "bg-emerald/10 text-emerald"
                                            : "text-text hover:bg-sand dark:hover:bg-slate-700"
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{label}</span>
                                    {theme === name && (
                                        <motion.div
                                            layoutId="activeTheme"
                                            className="mr-auto w-2 h-2 rounded-full bg-emerald"
                                        />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Simple icon-only toggle (alternative)
export function ModeToggleSimple() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="p-2 rounded-xl bg-sand dark:bg-slate-800">
                <div className="w-5 h-5" />
            </button>
        );
    }

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-sand dark:bg-slate-800 border border-border hover:border-emerald/30 transition-all"
            aria-label="تغيير المظهر"
        >
            <AnimatePresence mode="wait">
                {resolvedTheme === "dark" ? (
                    <motion.div
                        key="moon"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Moon className="w-5 h-5 text-gold" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sun className="w-5 h-5 text-gold" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
