"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// BADGE ASSETS MAP - PNG Image Files
// Maps badge IDs to their file paths in public/badges/
// ============================================================================
export const BADGE_ASSETS: Record<string, string> = {
    // Prize & Award badges
    "badge_1st_prize": "/badges/1st-prize.png",
    "badge_award": "/badges/award.png",
    "badge_film_award": "/badges/film-award.png",
    "badge_high_quality": "/badges/high-quality.png",
    "badge_success": "/badges/success.png",

    // Trophy badges
    "badge_trophy": "/badges/trophy.png",
    "badge_trophy_star": "/badges/trophy-star.png",
    "badge_trophy_star_1": "/badges/trophy-star (1).png",
    "badge_trophy_star_2": "/badges/trophy-star (2).png",
    "badge_trophy_star_4": "/badges/trophy-star (4).png",

    // Crown & Royalty badges
    "badge_crown": "/badges/crown.png",
    "badge_crown_1": "/badges/crown (1).png",
    "badge_coat_of_arms": "/badges/coat-of-arms.png",

    // Star & Medal badges
    "badge_star": "/badges/star.png",
    "badge_gold_medal": "/badges/gold-medal.png",
    "badge_first": "/badges/first.png",
    "badge_first_2": "/badges/first (2).png",
    "badge_rank": "/badges/rank.png",
    "badge_rank_1": "/badges/rank (1).png",

    // Decorative badges
    "badge_diamond": "/badges/diamond.png",
    "badge_diamond_1": "/badges/diamond (1).png",
    "badge_heart": "/badges/heart.png",
    "badge_laurel": "/badges/laurel.png",
    "badge_wreath": "/badges/wreath.png",

    // Action & Power badges
    "badge_power": "/badges/power.png",
    "badge_axe": "/badges/axe.png",
    "badge_club": "/badges/club.png",
    "badge_check_mark": "/badges/check-mark.png",

    // Reward badges
    "badge_reward": "/badges/reward.png",
    "badge_reward_1": "/badges/reward (1).png",

    // Generic badges
    "badge_generic": "/badges/badge.png",
    "badge_generic_1": "/badges/badge (1).png",
    "badge_generic_2": "/badges/badge (2).png",
    "badge_frame": "/badges/frame.png",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
export function getBadgeAsset(badgeId: string): string | null {
    return BADGE_ASSETS[badgeId] || null;
}

// ============================================================================
// TYPES
// ============================================================================
interface StudentBadgeProps {
    badgeId?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================
const SIZE_CLASSES = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function StudentBadge({ badgeId, size = "md", className }: StudentBadgeProps) {
    // Return null if no badge is equipped
    if (!badgeId) return null;

    const badgeAsset = BADGE_ASSETS[badgeId];

    // Return null if badge asset not found
    if (!badgeAsset) return null;

    return (
        <img
            src={badgeAsset}
            alt="Badge"
            className={cn(
                "inline-block object-contain select-none",
                SIZE_CLASSES[size],
                className
            )}
            onError={(e) => {
                const img = e.target as HTMLImageElement;
                console.error(`[StudentBadge] Badge image 404 - Path: "${badgeAsset}" | Badge ID: "${badgeId}"`);
                img.style.display = 'none';
            }}
        />
    );
}

// Export available badge IDs for store usage
export const AVAILABLE_BADGE_IDS = Object.keys(BADGE_ASSETS);
