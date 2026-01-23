"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Loader2, ArrowLeft, CheckCircle, KeyRound, ChevronDown } from "lucide-react";
import {
    useAuth,
    createUserProfile,
    createTeacherProfile,
    verifyTeacherInvite,
    getDashboardRoute,
    UserRole
} from "@/lib/auth/hooks";
import { OnboardingGuard } from "@/lib/auth/guards";
import { staggerContainer, fadeUp, buttonMotion } from "@/lib/motion";

const onboardingSchema = z.object({
    fullName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(50, "الاسم طويل جداً"),
    role: z.enum(["student", "sheikh"]),
    inviteCode: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
    return (
        <OnboardingGuard>
            <OnboardingContent />
        </OnboardingGuard>
    );
}

function OnboardingContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Teacher code state
    const [showTeacherCode, setShowTeacherCode] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [isValidatingCode, setIsValidatingCode] = useState(false);
    const [codeValidation, setCodeValidation] = useState<{ valid: boolean; error?: string } | null>(null);

    const form = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            fullName: user?.displayName || "",
            role: "student",
            inviteCode: "",
        },
    });

    // Prefill from Google profile if available
    useEffect(() => {
        if (user?.displayName) {
            form.setValue("fullName", user.displayName);
        }
    }, [user, form]);

    // Debounced code validation
    const validateCode = useCallback(async (code: string) => {
        if (!code || code.trim().length < 3) {
            setCodeValidation(null);
            return;
        }

        setIsValidatingCode(true);
        const result = await verifyTeacherInvite(code);
        setCodeValidation(result);
        setIsValidatingCode(false);

        // Auto-select sheikh role if code is valid
        if (result.valid) {
            form.setValue("role", "sheikh");
        } else {
            form.setValue("role", "student");
        }
    }, [form]);

    // Debounce code input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (showTeacherCode && inviteCode) {
                validateCode(inviteCode);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [inviteCode, showTeacherCode, validateCode]);

    // Reset validation when hiding teacher code section
    useEffect(() => {
        if (!showTeacherCode) {
            setInviteCode("");
            setCodeValidation(null);
            form.setValue("role", "student");
        }
    }, [showTeacherCode, form]);

    const handleSubmit = async (data: OnboardingFormData) => {
        if (!user) return;

        // If trying to submit as sheikh, validate the code one more time
        if (data.role === "sheikh") {
            if (!codeValidation?.valid) {
                setError("يرجى إدخال كود معلم صحيح");
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            if (data.role === "sheikh" && inviteCode) {
                // Use atomic transaction for teacher creation
                const result = await createTeacherProfile(user.uid, {
                    name: data.fullName,
                    email: user.email || undefined,
                    phone: user.phoneNumber || undefined,
                    photoURL: user.photoURL || undefined,
                }, inviteCode);

                if (!result.success) {
                    setError(result.error || "فشل في إنشاء حساب المعلم");
                    setIsLoading(false);
                    return;
                }
            } else {
                // Regular student profile
                await createUserProfile(user.uid, {
                    name: data.fullName,
                    email: user.email || undefined,
                    phone: user.phoneNumber || undefined,
                    photoURL: user.photoURL || undefined,
                    role: "student",
                });
            }

            // Redirect to dashboard
            router.replace(getDashboardRoute(data.role as UserRole));
        } catch (err: any) {
            console.error("Onboarding error:", err);
            setError("حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedRole = form.watch("role");

    return (
        <div className="min-h-screen bg-emerald-deep flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Patterns */}
            <div className="absolute inset-0 opacity-5">
                <div className="ornament-pattern h-full w-full" />
            </div>
            <div className="ornament-pattern-corner absolute top-0 right-0 opacity-10" />
            <div className="ornament-pattern-corner absolute bottom-0 left-0 rotate-180 opacity-10" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <motion.div variants={fadeUp} className="text-center mb-8">
                    <div className="inline-flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="حلقتي"
                            className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                        />
                        <span className="text-3xl font-bold text-white">حلقتي</span>
                    </div>
                </motion.div>

                {/* Card */}
                <motion.div
                    variants={fadeUp}
                    className="bg-surface rounded-3xl shadow-elevated p-8 border border-border"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald" />
                        </div>
                        <h1 className="text-2xl font-bold text-emerald-deep mb-2">
                            مرحباً بك في حلقتي
                        </h1>
                        <p className="text-text-muted">
                            أكمل معلومات حسابك للبدء
                        </p>
                    </div>

                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-emerald-deep mb-2">
                                الاسم الكامل *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...form.register("fullName")}
                                    placeholder="أدخل اسمك الكامل"
                                    className="w-full px-4 py-4 pr-12 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                                />
                                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            </div>
                            {form.formState.errors.fullName && (
                                <p className="text-red-500 text-sm mt-1">
                                    {form.formState.errors.fullName.message}
                                </p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-emerald-deep mb-3">
                                نوع الحساب *
                            </label>
                            <div className="space-y-3">
                                {/* Student Option - Always visible */}
                                <label
                                    className={`relative flex items-center gap-4 p-4 bg-sand border-2 rounded-xl cursor-pointer transition-all ${selectedRole === "student"
                                        ? "border-emerald bg-emerald/5"
                                        : "border-border hover:border-emerald/50"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        value="student"
                                        {...form.register("role")}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === "student" ? "bg-emerald text-white" : "bg-border/50 text-text-muted"
                                        }`}>
                                        📖
                                    </div>
                                    <div>
                                        <div className="font-medium text-emerald-deep">طالب</div>
                                        <div className="text-sm text-text-muted">انضم لحلقة وتابع تقدمك في الحفظ</div>
                                    </div>
                                    {selectedRole === "student" && (
                                        <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald" />
                                    )}
                                </label>

                                {/* Sheikh Option - Only visible when code is valid */}
                                <AnimatePresence>
                                    {codeValidation?.valid && (
                                        <motion.label
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`relative flex items-center gap-4 p-4 bg-sand border-2 rounded-xl cursor-pointer transition-all overflow-hidden ${selectedRole === "sheikh"
                                                ? "border-gold bg-gold/5"
                                                : "border-border hover:border-gold/50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                value="sheikh"
                                                {...form.register("role")}
                                                className="sr-only"
                                            />
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === "sheikh" ? "bg-gold text-white" : "bg-border/50 text-text-muted"
                                                }`}>
                                                🎓
                                            </div>
                                            <div>
                                                <div className="font-medium text-emerald-deep">معلم / شيخ</div>
                                                <div className="text-sm text-text-muted">أنشئ حلقات وتابع طلابك</div>
                                            </div>
                                            {selectedRole === "sheikh" && (
                                                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                                            )}
                                        </motion.label>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Teacher Code Toggle */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowTeacherCode(!showTeacherCode)}
                                className="flex items-center gap-2 text-sm text-emerald hover:text-emerald-deep transition-colors"
                            >
                                <KeyRound size={16} />
                                <span>لدي كود معلم</span>
                                <motion.div
                                    animate={{ rotate: showTeacherCode ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown size={16} />
                                </motion.div>
                            </button>

                            {/* Teacher Code Input */}
                            <AnimatePresence>
                                {showTeacherCode && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={inviteCode}
                                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                                    placeholder="أدخل كود المعلم"
                                                    className={`w-full px-4 py-3 pr-12 bg-sand border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all font-mono tracking-wider ${codeValidation?.valid
                                                            ? "border-emerald focus:ring-emerald/50 focus:border-emerald"
                                                            : codeValidation?.error
                                                                ? "border-red-400 focus:ring-red-400/50 focus:border-red-400"
                                                                : "border-border focus:ring-gold/50 focus:border-gold"
                                                        }`}
                                                    dir="ltr"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    {isValidatingCode ? (
                                                        <Loader2 size={18} className="text-text-muted animate-spin" />
                                                    ) : codeValidation?.valid ? (
                                                        <CheckCircle size={18} className="text-emerald" />
                                                    ) : (
                                                        <KeyRound size={18} className="text-text-muted" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Validation Message */}
                                            <AnimatePresence>
                                                {codeValidation && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -5 }}
                                                        className={`text-sm mt-2 ${codeValidation.valid ? "text-emerald" : "text-red-500"}`}
                                                    >
                                                        {codeValidation.valid ? "✓ كود صحيح - يمكنك التسجيل كمعلم" : codeValidation.error}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            variants={buttonMotion}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-gold flex items-center justify-center gap-2 py-4"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    ابدأ الآن
                                    <ArrowLeft size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
}
