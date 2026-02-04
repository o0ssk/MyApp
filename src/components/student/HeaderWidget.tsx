"use client";

import { useState, useEffect, useCallback } from "react";
import { Sun, Moon, Sunrise, Sunset, CloudSun, MapPin, RefreshCw } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

interface PrayerInfo {
    key: keyof PrayerTimes;
    nameAr: string;
    icon: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Prayer Configuration
// ─────────────────────────────────────────────────────────────────────────────

const PRAYER_CONFIG: PrayerInfo[] = [
    { key: "Fajr", nameAr: "الفجر", icon: <Sunrise className="w-4 h-4" /> },
    { key: "Sunrise", nameAr: "الشروق", icon: <Sun className="w-4 h-4" /> },
    { key: "Dhuhr", nameAr: "الظهر", icon: <Sun className="w-4 h-4" /> },
    { key: "Asr", nameAr: "العصر", icon: <CloudSun className="w-4 h-4" /> },
    { key: "Maghrib", nameAr: "المغرب", icon: <Sunset className="w-4 h-4" /> },
    { key: "Isha", nameAr: "العشاء", icon: <Moon className="w-4 h-4" /> },
];

// Default location (Jeddah, Saudi Arabia)
const DEFAULT_LOCATION = {
    latitude: 21.4858,
    longitude: 39.1925,
    city: "جدة",
};

// Aladhan API calculation methods
// 4 = Umm Al-Qura University, Makkah (commonly used in Saudi Arabia)
const CALCULATION_METHOD = 4;

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function getGregorianDate(): string {
    return new Intl.DateTimeFormat("ar-SA", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        calendar: "gregory",
    }).format(new Date());
}

function getHijriDate(): string {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date());
}

function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function formatTimeRemaining(diffMinutes: number): string {
    if (diffMinutes < 0) return "غداً";

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) {
        if (minutes > 0) {
            return `${hours} س ${minutes} د`;
        }
        return `${hours} ساعة`;
    }
    return `${minutes} دقيقة`;
}

function getNextPrayer(prayerTimes: PrayerTimes | null): { prayer: PrayerInfo; time: string; timeRemaining: string } | null {
    if (!prayerTimes) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const prayer of PRAYER_CONFIG) {
        const prayerTime = prayerTimes[prayer.key];
        if (!prayerTime) continue;

        const prayerMinutes = timeToMinutes(prayerTime);

        if (prayerMinutes > currentMinutes) {
            return {
                prayer,
                time: prayerTime,
                timeRemaining: formatTimeRemaining(prayerMinutes - currentMinutes),
            };
        }
    }

    // All prayers passed, return Fajr for tomorrow
    return {
        prayer: PRAYER_CONFIG[0],
        time: prayerTimes.Fajr,
        timeRemaining: "غداً",
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────────────────────

async function fetchPrayerTimes(latitude: number, longitude: number): Promise<PrayerTimes | null> {
    try {
        const today = new Date();
        const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

        const response = await fetch(
            `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${CALCULATION_METHOD}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch prayer times");
        }

        const data = await response.json();
        return data.data.timings as PrayerTimes;
    } catch (error) {
        console.error("Error fetching prayer times:", error);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function HeaderWidget() {
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [location, setLocation] = useState(DEFAULT_LOCATION);
    const [isLoading, setIsLoading] = useState(true);
    const [nextPrayerInfo, setNextPrayerInfo] = useState<ReturnType<typeof getNextPrayer>>(null);

    // Fetch prayer times
    const loadPrayerTimes = useCallback(async (lat: number, lng: number) => {
        setIsLoading(true);
        const times = await fetchPrayerTimes(lat, lng);
        setPrayerTimes(times);
        if (times) {
            setNextPrayerInfo(getNextPrayer(times));
        }
        setIsLoading(false);
    }, []);

    // Get user location and fetch prayer times
    useEffect(() => {
        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude, city: "موقعك" });
                    loadPrayerTimes(latitude, longitude);
                },
                () => {
                    // Fallback to default location on error
                    loadPrayerTimes(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
                },
                { timeout: 5000 }
            );
        } else {
            loadPrayerTimes(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
        }
    }, [loadPrayerTimes]);

    // Update next prayer every minute
    useEffect(() => {
        if (!prayerTimes) return;

        const interval = setInterval(() => {
            setNextPrayerInfo(getNextPrayer(prayerTimes));
        }, 60000);

        return () => clearInterval(interval);
    }, [prayerTimes]);

    const gregorianDate = getGregorianDate();
    const hijriDate = getHijriDate();

    return (
        <div className="w-full md:w-auto">
            {/* Mobile: Full-width glass card | Desktop: Inline transparent */}
            <div className="
                flex items-center justify-between gap-4
                w-full px-4 py-3
                bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm
                md:w-auto md:bg-transparent md:backdrop-blur-none md:rounded-none md:border-0 md:shadow-none md:p-0 md:gap-4
            ">
                {/* Date Section */}
                <div className="flex-1 md:flex-initial text-right md:text-left">
                    <div className="text-sm md:text-sm font-bold text-emerald-deep">{hijriDate}</div>
                    <div className="text-xs text-text-muted truncate">{gregorianDate}</div>
                </div>

                {/* Divider - Desktop only */}
                <div className="hidden md:block w-px h-10 bg-border" />

                {/* Next Prayer Badge */}
                <div className="flex items-center gap-2 md:gap-3 px-3 py-2 bg-emerald/10 md:bg-emerald/5 rounded-xl border border-emerald/20 md:border-emerald/10">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-emerald" />
                            <span className="text-xs text-text-muted">جارٍ التحميل...</span>
                        </div>
                    ) : nextPrayerInfo ? (
                        <>
                            <div className="p-2 bg-emerald/20 md:bg-emerald/10 rounded-lg text-emerald">
                                {nextPrayerInfo.prayer.icon}
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-emerald-deep">{nextPrayerInfo.prayer.nameAr}</span>
                                    <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold">
                                        {nextPrayerInfo.time}
                                    </span>
                                </div>
                                <div className="text-xs text-text-muted flex items-center gap-1">
                                    <span>بعد {nextPrayerInfo.timeRemaining}</span>
                                    <span className="hidden md:inline">•</span>
                                    <span className="hidden md:inline">{location.city}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <span className="text-xs text-text-muted">تعذر تحميل المواقيت</span>
                    )}
                </div>
            </div>
        </div>
    );
}
