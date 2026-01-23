"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Save,
    LogOut,
    Check,
    Camera,
    Loader2
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

import { db, auth } from "@/lib/firebase/client";
import { useAuth, UserProfile } from "@/lib/auth/hooks";
import { useStorage } from "@/lib/hooks/useStorage";
import { useToast } from "@/components/ui/Toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { fadeUp, staggerContainer, listItem } from "@/lib/motion";

// Premium avatar presets (emoji-based for V1)
const AVATAR_PRESETS = [
    { id: "scholar", emoji: "🧑‍🏫", label: "معلم" },
    { id: "student", emoji: "📖", label: "طالب" },
    { id: "book", emoji: "📚", label: "كتب" },
    { id: "star", emoji: "⭐", label: "نجم" },
    { id: "crown", emoji: "👑", label: "تاج" },
    { id: "mosque", emoji: "🕌", label: "مسجد" },
];

interface ProfileFormProps {
    showRoleBadge?: boolean;
}

export function ProfileForm({ showRoleBadge = true }: ProfileFormProps) {
    const { user, userProfile } = useAuth();
    const { showToast } = useToast();
    const { uploadFile, uploading, progress } = useStorage();
    const router = useRouter();

    // Form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Load profile data
    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || "");
            setPhone(userProfile.phone || "");
            setSelectedAvatar(userProfile.photoURL || null);
        }
    }, [userProfile]);

    // Role badge
    const getRoleBadge = () => {
        if (!userProfile?.role) return null;
        const isStudent = userProfile.role === "student";
        return (
            <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${isStudent
                    ? "bg-emerald/10 text-emerald"
                    : "bg-gold/10 text-gold"
                    }`}
            >
                {isStudent ? "طالب" : "شيخ"}
            </span>
        );
    };

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            const path = `profile_images/${user.uid}/avatar_${Date.now()}`;

            const result = await uploadFile(file, path);

            if (result.url) {
                setSelectedAvatar(result.url);
                showToast("تم تحميل الصورة بنجاح", "success");
            } else if (result.error) {
                showToast(result.error, "error");
            }
        }
    };

    // Save profile
    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                name: name.trim(),
                phone: phone.trim(),
                photoURL: selectedAvatar,
                updatedAt: new Date(),
            });
            showToast("تم حفظ التغييرات بنجاح", "success");

            // Force page refresh to update context
            window.location.reload();
        } catch (error) {
            console.error("Error saving profile:", error);
            showToast("فشل في حفظ التغييرات", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // Logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
            showToast("فشل في تسجيل الخروج", "error");
            setIsLoggingOut(false);
        }
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Profile Header Card */}
            <motion.div variants={listItem}>
                <Card>
                    <CardContent className="flex flex-col items-center py-8">
                        {/* Avatar Wrapper */}
                        <div className="relative mb-4 group w-24 h-24">
                            <div className="w-full h-full rounded-full border-4 border-emerald/20 overflow-hidden bg-sand">
                                {uploading ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 text-white">
                                        <Loader2 className="animate-spin mb-1" size={24} />
                                        <span className="text-[10px]">{Math.round(progress)}%</span>
                                    </div>
                                ) : (
                                    <Avatar
                                        src={selectedAvatar}
                                        name={name || "User"}
                                        size="xl"
                                        className="w-full h-full"
                                    />
                                )}
                            </div>

                            {/* Camera Icon - Visual Layer Only (Pointer Events None) */}
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald text-white rounded-full flex items-center justify-center shadow-lg z-40 pointer-events-none">
                                <Camera size={16} />
                            </div>

                            {/* Transparent Input Overlay - The Real Trigger */}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={uploading}
                                className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[0px] file:hidden z-50 ${uploading ? 'cursor-not-allowed' : ''}`}
                                title=""
                            />
                        </div>

                        {/* Name */}
                        <h2 className="text-xl font-bold text-emerald-deep mb-1">
                            {name || "مستخدم"}
                        </h2>

                        {/* Email */}
                        <p className="text-text-muted text-sm mb-3">
                            {userProfile?.email}
                        </p>

                        {/* Role Badge */}
                        {showRoleBadge && getRoleBadge()}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Edit Form Card */}
            <motion.div variants={listItem}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User size={20} className="text-emerald" />
                            تعديل البيانات
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-emerald-deep mb-1">
                                الاسم الكامل
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-colors"
                                placeholder="أدخل اسمك الكامل"
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-emerald-deep mb-1">
                                <Mail size={14} className="inline ml-1" />
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                value={userProfile?.email || ""}
                                disabled
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-text-muted cursor-not-allowed"
                            />
                            <p className="text-xs text-text-muted mt-1">
                                لا يمكن تغيير البريد الإلكتروني
                            </p>
                        </div>

                        {/* Phone Input */}
                        <div>
                            <label className="block text-sm font-medium text-emerald-deep mb-1">
                                <Phone size={14} className="inline ml-1" />
                                رقم الهاتف (اختياري)
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-colors"
                                placeholder="+966 5XX XXX XXXX"
                                dir="ltr"
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Avatar Selection Card - Students Only */}
            {userProfile?.role === 'student' && (
                <motion.div variants={listItem}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-lg">🎨</span>
                                اختر صورتك الرمزية
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {AVATAR_PRESETS.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => setSelectedAvatar(avatar.emoji)}
                                        className={`relative p-4 rounded-xl border-2 transition-all ${selectedAvatar === avatar.emoji
                                            ? "border-emerald bg-emerald/5 shadow-lg"
                                            : "border-gray-200 hover:border-emerald/50 hover:bg-sand"
                                            }`}
                                    >
                                        <span className="text-3xl block text-center">
                                            {avatar.emoji}
                                        </span>
                                        <span className="text-xs text-text-muted block text-center mt-1">
                                            {avatar.label}
                                        </span>
                                        {selectedAvatar === avatar.emoji && (
                                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-emerald rounded-full flex items-center justify-center">
                                                <Check size={14} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div variants={listItem} className="flex flex-col gap-3">
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !name.trim()}
                    className="w-full"
                >
                    {isSaving ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            جارٍ الحفظ...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            حفظ التغييرات
                        </>
                    )}
                </Button>

                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-red-500 hover:bg-red-50"
                >
                    {isLoggingOut ? (
                        <>
                            <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            جارٍ الخروج...
                        </>
                    ) : (
                        <>
                            <LogOut size={18} />
                            تسجيل الخروج
                        </>
                    )}
                </Button>
            </motion.div>
        </motion.div>
    );
}
