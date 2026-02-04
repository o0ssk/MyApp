"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/hooks";
import { motion } from "framer-motion";
import { Settings, Loader2 } from "lucide-react";

import { fadeUp } from "@/lib/motion";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { StudentBadge } from "@/components/ui/StudentBadge";

export default function StudentSettingsPage() {
    const { user } = useAuth();
    const [liveUserData, setLiveUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, "users", user.uid),
            (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    console.log('🔍 Settings Page - User Data:', {
                        name: data?.name,
                        equippedBadge: data?.equippedBadge,
                        equippedFrame: data?.equippedFrame,
                    });
                    setLiveUserData(data);
                }
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching user data for settings:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user?.uid]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[50vh] gap-3">
                <Loader2 className="animate-spin text-emerald" size={48} />
                <span className="text-text-muted font-medium">جارٍ تحميل الإعدادات...</span>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-8 flex flex-col items-center text-center"
            >
                {/* Live Avatar Preview */}
                <div className="mb-4">
                    <StudentAvatar
                        student={{
                            name: liveUserData?.name || user?.displayName || "طالب",
                            photoURL: liveUserData?.photoURL,
                            equippedFrame: liveUserData?.equippedFrame,
                            equippedBadge: liveUserData?.equippedBadge,
                            equippedAvatar: liveUserData?.equippedAvatar,
                        }}
                        size="xl"
                        className="w-28 h-28 shadow-lg"
                    />
                </div>
                {/* Student Name with Badge */}
                <h2 className="text-lg font-bold text-emerald-deep flex items-center justify-center gap-2 mb-2">
                    {liveUserData?.name || user?.displayName || "طالب"}
                    <StudentBadge badgeId={liveUserData?.equippedBadge} size="md" />
                </h2>
                <h1 className="text-2xl font-bold text-emerald-deep flex items-center gap-2">
                    <Settings size={28} className="text-gold" />
                    الإعدادات
                </h1>
                <p className="text-text-muted">إدارة حسابك وتفضيلاتك</p>
            </motion.div>

            {/* Shared Profile Form with Live Data */}
            <ProfileForm showRoleBadge={true} studentData={liveUserData} />
        </div>
    );
}
