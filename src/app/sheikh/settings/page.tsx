"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";

import { useToast } from "@/components/ui/Toast";
import { fadeUp } from "@/lib/motion";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function SettingsPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6"
            >
                <h1 className="text-2xl font-bold text-emerald-deep flex items-center gap-2">
                    <Settings size={28} className="text-gold" />
                    الإعدادات
                </h1>
                <p className="text-text-muted">إدارة حسابك وتفضيلاتك</p>
            </motion.div>

            {/* Shared Profile Form */}
            <ProfileForm showRoleBadge={true} />
        </div>
    );
}
