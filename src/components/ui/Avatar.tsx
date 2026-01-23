"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface AvatarProps {
    src?: string | null;
    name?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    onClick?: () => void;
}

// Map sizes to dimensions
const SIZE_MAP = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
};

// Map sizes to icon sizes
const ICON_SIZE_MAP = {
    sm: 14,
    md: 18,
    lg: 28,
    xl: 40,
};

// Generate background color based on name
const getInitialsColor = (name: string) => {
    const colors = [
        "bg-emerald/10 text-emerald",
        "bg-gold/10 text-gold",
        "bg-blue-100 text-blue-600",
        "bg-purple-100 text-purple-600",
        "bg-pink-100 text-pink-600",
        "bg-orange-100 text-orange-600",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
        sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
};

// Get initials (up to 2 chars)
const getInitials = (name: string) => {
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
};

export function Avatar({ src, name = "", size = "md", className = "", onClick }: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    // Reset error when src changes
    useEffect(() => {
        setImageError(false);
    }, [src]);

    // Determine content
    let content;

    // Check if it's an emoji (basic check for non-url string length < 5 to catch single/double emojis)
    const isEmoji = src && !src.startsWith("http") && src.length < 10;

    if (isEmoji) {
        content = <span className="flex items-center justify-center w-full h-full">{src}</span>;
    } else if (src && !imageError) {
        content = (
            <img
                src={src}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
            />
        );
    } else if (name) {
        content = (
            <span className={`w-full h-full flex items-center justify-center font-bold ${getInitialsColor(name)}`}>
                {getInitials(name)}
            </span>
        );
    } else {
        content = (
            <div className="w-full h-full bg-sand flex items-center justify-center">
                <User size={ICON_SIZE_MAP[size]} className="text-text-muted" />
            </div>
        );
    }

    return (
        <div
            className={`relative rounded-full overflow-hidden flex-shrink-0 ${SIZE_MAP[size]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            {content}
        </div>
    );
}
