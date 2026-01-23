"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";

import { ProfileForm } from "@/components/profile/ProfileForm";
import { fadeUp } from "@/lib/motion";

export default function StudentProfilePage() {
    return (
        <div className="max-w-xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-6"
            >
                <h1 className="text-2xl font-bold text-emerald-deep flex items-center gap-2">
                    <User size={28} className="text-gold" />
                    الملف الشخصي
                </h1>
                <p className="text-text-muted">إدارة بياناتك الشخصية</p>
            </motion.div>

            {/* Profile Form */}
            <ProfileForm showRoleBadge={true} />
        </div>
    );
}
