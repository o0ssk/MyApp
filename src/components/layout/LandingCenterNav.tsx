"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Data
// ─────────────────────────────────────────────────────────────────────────────

const navItems = [
    { label: "الرئيسية", href: "#hero", id: "hero" },
    { label: "المميزات", href: "#features", id: "features" },
    { label: "كيف نعمل", href: "#how-it-works", id: "how-it-works" },
    { label: "تواصل", href: "/contact", id: "contact" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Themed Slide Tabs Component (Emerald & Sand)
// ─────────────────────────────────────────────────────────────────────────────

export function LandingCenterNav() {
    const [activeTab, setActiveTab] = useState<string>(navItems[0].href);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [position, setPosition] = useState<{
        left: number;
        width: number;
        opacity: number;
    }>({
        left: 0,
        width: 0,
        opacity: 0,
    });

    // Refs for items to measure position
    const itemsRef = useRef<(HTMLLIElement | null)[]>([]);

    useEffect(() => {
        // Initialize position to the active tab on mount or change
        // Only update if not hovering
        if (hoveredIndex === null) {
            const activeIndex = navItems.findIndex(item => item.href === activeTab);
            if (activeIndex !== -1 && itemsRef.current[activeIndex]) {
                const currentTab = itemsRef.current[activeIndex];
                if (currentTab) {
                    setPosition({
                        left: currentTab.offsetLeft,
                        width: currentTab.offsetWidth,
                        opacity: 1,
                    });
                }
            }
        }
    }, [activeTab, hoveredIndex]);

    const handleMouseEnter = (index: number) => {
        setHoveredIndex(index);
        const currentTab = itemsRef.current[index];
        if (currentTab) {
            setPosition({
                left: currentTab.offsetLeft,
                width: currentTab.offsetWidth,
                opacity: 1,
            });
        }
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
        // Position reset is handled by the useEffect above when hoveredIndex becomes null
    };

    // Calculate effective active index for text coloring
    const activeIndex = navItems.findIndex(item => item.href === activeTab);
    const effectiveIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

    return (
        <nav className="hidden md:flex items-center justify-center">
            <ul
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "relative flex w-fit items-center rounded-full border p-1.5",
                    // Theme Container: Sand Background + Subtle Emerald Border
                    "bg-[#F6F1E7]/50 backdrop-blur-md border-emerald-900/10",
                    "shadow-sm hover:shadow-md transition-shadow duration-300"
                )}
            >
                {/* The Sliding Cursor (Emerald Green) */}
                <li
                    aria-hidden="true"
                    className="absolute top-1.5 bottom-1.5 rounded-full bg-[#0F3D2E] shadow-md transition-[left,width,opacity] duration-300 ease-out pointer-events-none z-0"
                    style={{
                        left: position.left,
                        width: position.width,
                        opacity: position.opacity,
                    }}
                />

                {/* Tab Items */}
                {navItems.map((item, index) => {
                    const isEffectiveActive = index === effectiveIndex;

                    return (
                        <li
                            key={item.href}
                            ref={(el) => { itemsRef.current[index] = el; }}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onClick={() => setActiveTab(item.href)}
                            className="relative z-10 block cursor-pointer"
                        >
                            <Link
                                href={item.href}
                                className={cn(
                                    "block px-6 py-2.5 text-base font-medium transition-colors duration-300 rounded-full",
                                    // Logic: If index matches where the cursor IS (effectiveIndex), it's Light.
                                    // Otherwise it's Dark.
                                    isEffectiveActive
                                        ? "text-[#F6F1E7]"
                                        : "text-emerald-900/70 hover:text-emerald-900"
                                )}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
