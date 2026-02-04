"use client";

import React from "react";
import {
    User,
    Star,
    Trophy,
    Crown,
    Medal,
    Shield,
    Gem,
    Zap,
    Heart,
    Flame,
    Moon,
    Sparkles,
    Award
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
interface StudentAvatarProps {
    student?: {
        photoURL?: string | null;
        equipped?: {
            frame?: string;
            badge?: string;
        };
        equippedFrame?: string;
        equippedBadge?: string;
        equippedAvatar?: string;
        name?: string;
    } | null;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

// ============================================================================
// FRAME ASSETS MAP - PNG Image Overlays
// ============================================================================
export const FRAME_ASSETS: Record<string, string> = {
    "frame_gold": "/frames/award.png",
    "frame_circle": "/frames/circle.png",
    "frame_daisy": "/frames/daisy.png",
    "frame_flower_purple": "/frames/flower_3.png",
    "frame_flower": "/frames/flower.png",
    "frame_classic": "/frames/frame.png",
    "frame_laurel": "/frames/laurel-wreath.png",
    "frame_photo": "/frames/photo-frame.png",
    "frame_round": "/frames/round.png",
    "frame_wreath_award": "/frames/wreath-award.png",
    "frame_wreath": "/frames/wreath.png",
};

// ============================================================================
// BADGE CONFIGURATION
// ============================================================================
const BADGE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
    "badge_gold_star": { icon: Star, color: "text-yellow-500 fill-yellow-500" },
    "badge_diamond_star": { icon: Star, color: "text-cyan-400 fill-cyan-400" },
    "badge_ruby_star": { icon: Star, color: "text-red-500 fill-red-500" },
    "badge_emerald_star": { icon: Star, color: "text-emerald-500 fill-emerald-500" },
    "badge_gold_crown": { icon: Crown, color: "text-yellow-500 fill-yellow-500" },
    "badge_diamond_crown": { icon: Crown, color: "text-cyan-400 fill-cyan-400" },
    "badge_gold_trophy": { icon: Trophy, color: "text-yellow-500" },
    "badge_ruby_heart": { icon: Heart, color: "text-red-500 fill-red-500" },
    "badge_gold_flame": { icon: Flame, color: "text-orange-500 fill-orange-500" },
    "badge_diamond_gem": { icon: Gem, color: "text-cyan-400 fill-cyan-400" },
    "badge_gold_medal": { icon: Medal, color: "text-yellow-500" },
    "badge_emerald_shield": { icon: Shield, color: "text-emerald-500" },
    "badge_plasma_zap": { icon: Zap, color: "text-fuchsia-500 fill-fuchsia-500" },
    "badge_silver_moon": { icon: Moon, color: "text-slate-400 fill-slate-400" },
    // Legacy
    "badge_star": { icon: Star, color: "text-yellow-400 fill-yellow-400" },
    "badge_crescent": { icon: Moon, color: "text-blue-400 fill-blue-400" },
    "badge_top": { icon: Trophy, color: "text-yellow-500" },
    "badge_star_gold": { icon: Sparkles, color: "text-amber-400" },
    "badge_quran": { icon: Award, color: "text-emerald-500" },
};

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================
const SIZE_CONFIG = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-28 h-28"
};

const PHOTO_INSET = {
    sm: "inset-[15%]",
    md: "inset-[12%]",
    lg: "inset-[10%]",
    xl: "inset-[10%]"
};

const ICON_SIZES = {
    sm: 16,
    md: 22,
    lg: 32,
    xl: 44
};

const BADGE_SIZES = {
    sm: { size: "w-4 h-4", icon: 10, position: "-bottom-0.5 -right-0.5" },
    md: { size: "w-5 h-5", icon: 12, position: "-bottom-1 -right-1" },
    lg: { size: "w-7 h-7", icon: 16, position: "-bottom-1.5 -right-1.5" },
    xl: { size: "w-9 h-9", icon: 20, position: "-bottom-2 -right-2" }
};

// ============================================================================
// EXPORTED HELPERS FOR STORE
// ============================================================================
export function getFramePreviewClass(frameId: string): string {
    // For PNG frames, return minimal styling
    return FRAME_ASSETS[frameId] ? "" : "ring-2 ring-gray-200";
}

export function getFrameAsset(frameId: string): string | null {
    return FRAME_ASSETS[frameId] || null;
}

export function getBadgePreviewIcon(badgeId: string): React.ElementType {
    const config = BADGE_CONFIG[badgeId];
    if (config) return config.icon;

    const iconMap: Record<string, React.ElementType> = {
        star: Star, trophy: Trophy, crown: Crown, medal: Medal,
        shield: Shield, gem: Gem, zap: Zap, heart: Heart, flame: Flame, moon: Moon
    };

    for (const [key, icon] of Object.entries(iconMap)) {
        if (badgeId.includes(key)) return icon;
    }

    return Star;
}

export function getBadgeColorClass(badgeId: string): string {
    const config = BADGE_CONFIG[badgeId];
    if (config) return config.color;

    if (badgeId.includes("gold")) return "text-yellow-500 fill-yellow-500";
    if (badgeId.includes("diamond")) return "text-cyan-400 fill-cyan-400";
    if (badgeId.includes("ruby")) return "text-red-500 fill-red-500";
    if (badgeId.includes("emerald")) return "text-emerald-500 fill-emerald-500";

    return "text-yellow-400";
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function StudentAvatar({ student, size = "md", className }: StudentAvatarProps) {
    if (!student) {
        return (
            <div className={cn(
                "relative inline-block rounded-full bg-slate-100",
                SIZE_CONFIG[size],
                className
            )} />
        );
    }

    // Resolve equipped items
    const frameId = student.equippedFrame || student.equipped?.frame || "";
    const badgeId = student.equippedBadge || student.equipped?.badge;

    // Check if we have a PNG frame asset
    const frameAsset = FRAME_ASSETS[frameId];
    const hasFrame = !!frameAsset;

    // Get badge config
    const badgeConfig = badgeId ? BADGE_CONFIG[badgeId] : null;
    const BadgeIcon = badgeConfig?.icon || (badgeId ? getBadgePreviewIcon(badgeId) : null);
    const badgeColor = badgeConfig?.color || (badgeId ? getBadgeColorClass(badgeId) : "");
    const badgeSizeConfig = BADGE_SIZES[size];

    return (
        <div className={cn("relative inline-block", SIZE_CONFIG[size], className)}>

            {/* Layer 1 (Bottom): User Photo */}
            <div className={cn(
                "absolute rounded-full overflow-hidden bg-slate-100 flex items-center justify-center",
                hasFrame ? PHOTO_INSET[size] : "inset-0"
            )}>
                {student.photoURL ? (
                    <img
                        src={student.photoURL}
                        alt={student.name || "Student"}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <User size={ICON_SIZES[size]} className="text-slate-400" />
                )}
            </div>

            {/* Layer 2 (Top): Frame Image Overlay */}
            {hasFrame && (
                <img
                    src={frameAsset}
                    alt="Frame"
                    className="absolute inset-0 w-full h-full z-10 pointer-events-none object-contain"
                    onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        console.error(`[StudentAvatar] Frame image 404 - Path: "${frameAsset}" | Frame ID: "${frameId}"`);
                        // Add red border to show broken image
                        img.style.border = '2px solid red';
                        img.style.borderRadius = '50%';
                        img.style.background = 'rgba(255,0,0,0.1)';
                    }}
                />
            )}

            {/* Fallback ring if no frame */}
            {!hasFrame && (
                <div className="absolute inset-0 rounded-full ring-2 ring-gray-200 pointer-events-none" />
            )}
        </div>
    );
}

// ============================================================================
// FRAME PREVIEW COMPONENT (For Store)
// ============================================================================
export function FramePreview({
    frameId,
    size = "md"
}: {
    frameId: string;
    size?: "sm" | "md" | "lg"
}) {
    const sizeClasses = { sm: "w-14 h-14", md: "w-20 h-20", lg: "w-24 h-24" };
    const iconSizes = { sm: 20, md: 28, lg: 36 };
    const photoInset = { sm: "inset-[15%]", md: "inset-[12%]", lg: "inset-[10%]" };

    const frameAsset = FRAME_ASSETS[frameId];

    return (
        <div className={cn("relative", sizeClasses[size])}>
            {/* Placeholder avatar */}
            <div className={cn(
                "absolute rounded-full bg-slate-200 flex items-center justify-center",
                frameAsset ? photoInset[size] : "inset-0"
            )}>
                <Sparkles className="text-slate-400" size={iconSizes[size]} />
            </div>

            {/* Frame overlay */}
            {frameAsset && (
                <img
                    src={frameAsset}
                    alt="Frame Preview"
                    className="absolute inset-0 w-full h-full z-10 pointer-events-none object-contain"
                />
            )}

            {/* Fallback ring */}
            {!frameAsset && (
                <div className="absolute inset-0 rounded-full ring-2 ring-gray-200" />
            )}
        </div>
    );
}

// Export available frame IDs for store
export const AVAILABLE_FRAME_IDS = Object.keys(FRAME_ASSETS);
