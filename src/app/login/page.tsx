"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Loader2,
} from "lucide-react";
import {
    useAuth,
    useEmailAuth,
    useGoogleAuth,
    checkUserProfileExists,
} from "@/lib/auth/hooks";
import { GuestGuard } from "@/lib/auth/guards";
import { staggerContainer, fadeUp, buttonMotion } from "@/lib/motion";

// ========================
// Form Schemas
// ========================

const emailLoginSchema = z.object({
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

const emailRegisterSchema = emailLoginSchema
    .extend({
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "كلمات المرور غير متطابقة",
        path: ["confirmPassword"],
    });

const resetPasswordSchema = z.object({
    email: z.string().email("البريد الإلكتروني غير صحيح"),
});

type EmailMode = "login" | "register" | "reset";

// ========================
// Main Login Page
// ========================

export default function LoginPage() {
    return (
        <GuestGuard>
            <LoginContent />
        </GuestGuard>
    );
}

function LoginContent() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    // Handle redirect after successful auth
    useEffect(() => {
        if (user && !authLoading) {
            checkUserProfileExists(user.uid).then((exists) => {
                if (exists) {
                    router.replace("/app/dashboard");
                } else {
                    router.replace("/onboarding");
                }
            });
        }
    }, [user, authLoading, router]);

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
                    <Link href="/" className="inline-flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="حلقتي"
                            className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                        />
                        <span className="text-3xl font-bold text-white">حلقتي</span>
                    </Link>
                </motion.div>

                {/* Auth Card */}
                <motion.div
                    variants={fadeUp}
                    className="bg-surface rounded-3xl shadow-elevated p-8 border border-border"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-emerald-deep mb-2">
                            مرحباً بك
                        </h1>
                        <p className="text-text-muted">سجل دخولك للمتابعة إلى حسابك</p>
                    </div>

                    {/* Email Auth Form */}
                    <EmailAuthForm />

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-text-muted text-sm">أو</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Google Sign-In */}
                    <GoogleSignInButton />
                </motion.div>

                {/* Back to Home */}
                <motion.div variants={fadeUp} className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-white/80 hover:text-white transition-colors inline-flex items-center gap-2"
                    >
                        <ArrowRight size={16} />
                        العودة للرئيسية
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}

// ========================
// Email Auth Form
// ========================

function EmailAuthForm() {
    const router = useRouter();
    const { isLoading, error, signIn, signUp, resetPassword, clearError } =
        useEmailAuth();
    const { user } = useAuth();
    const [mode, setMode] = useState<EmailMode>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const loginForm = useForm({
        resolver: zodResolver(emailLoginSchema),
        defaultValues: { email: "", password: "" },
    });

    const registerForm = useForm({
        resolver: zodResolver(emailRegisterSchema),
        defaultValues: { email: "", password: "", confirmPassword: "" },
    });

    const resetForm = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { email: "" },
    });

    // Handle redirect after auth
    useEffect(() => {
        if (user) {
            checkUserProfileExists(user.uid).then((exists) => {
                router.replace(exists ? "/app/dashboard" : "/onboarding");
            });
        }
    }, [user, router]);

    const handleLogin = async (data: { email: string; password: string }) => {
        clearError();
        await signIn(data.email, data.password);
    };

    const handleRegister = async (data: { email: string; password: string }) => {
        clearError();
        await signUp(data.email, data.password);
    };

    const handleReset = async (data: { email: string }) => {
        clearError();
        const success = await resetPassword(data.email);
        if (success) {
            setResetSent(true);
        }
    };

    const switchMode = (newMode: EmailMode) => {
        clearError();
        setMode(newMode);
        setResetSent(false);
    };

    // Reset Password Form
    if (mode === "reset") {
        if (resetSent) {
            return (
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-deep mb-2">
                        تم إرسال رابط إعادة التعيين
                    </h3>
                    <p className="text-text-muted mb-4">
                        تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور
                    </p>
                    <button
                        onClick={() => switchMode("login")}
                        className="text-gold hover:text-gold/80 transition-colors font-medium"
                    >
                        العودة لتسجيل الدخول
                    </button>
                </div>
            );
        }

        return (
            <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-5">
                <div className="text-center mb-4">
                    <h3 className="font-bold text-emerald-deep">نسيت كلمة المرور؟</h3>
                    <p className="text-sm text-text-muted">أدخل بريدك لإعادة التعيين</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                        البريد الإلكتروني
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            {...resetForm.register("email")}
                            placeholder="example@email.com"
                            className="w-full px-4 py-4 pr-12 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                            dir="ltr"
                        />
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    </div>
                    {resetForm.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                            {resetForm.formState.errors.email.message}
                        </p>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

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
                        "إرسال رابط إعادة التعيين"
                    )}
                </motion.button>

                <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="w-full text-sm text-text-muted hover:text-emerald transition-colors"
                >
                    العودة لتسجيل الدخول
                </button>
            </form>
        );
    }

    // Login Form
    if (mode === "login") {
        return (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                        البريد الإلكتروني
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            {...loginForm.register("email")}
                            placeholder="example@email.com"
                            className="w-full px-4 py-4 pr-12 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                            dir="ltr"
                        />
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    </div>
                    {loginForm.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                            {loginForm.formState.errors.email.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                        كلمة المرور
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            {...loginForm.register("password")}
                            placeholder="••••••••"
                            className="w-full px-4 py-4 pr-12 pl-12 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                            dir="ltr"
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-emerald transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {loginForm.formState.errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                            {loginForm.formState.errors.password.message}
                        </p>
                    )}
                </div>

                {/* Forgot Password */}
                <div className="text-left">
                    <button
                        type="button"
                        onClick={() => switchMode("reset")}
                        className="text-sm text-gold hover:text-gold/80 transition-colors"
                    >
                        نسيت كلمة المرور؟
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        <AlertCircle size={18} />
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
                            تسجيل الدخول
                            <ArrowLeft size={18} />
                        </>
                    )}
                </motion.button>

                {/* Switch Mode */}
                <p className="text-center text-text-muted text-sm">
                    ليس لديك حساب؟{" "}
                    <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className="text-emerald font-medium hover:text-emerald-deep transition-colors"
                    >
                        سجل الآن
                    </button>
                </p>
            </form>
        );
    }

    // Register Form
    return (
        <form
            onSubmit={registerForm.handleSubmit(handleRegister)}
            className="space-y-5"
        >
            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-emerald-deep mb-2">
                    البريد الإلكتروني
                </label>
                <div className="relative">
                    <input
                        type="email"
                        {...registerForm.register("email")}
                        placeholder="example@email.com"
                        className="w-full px-4 py-4 pr-12 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                        dir="ltr"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                </div>
                {registerForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.email.message}
                    </p>
                )}
            </div>

            {/* Password */}
            <div>
                <label className="block text-sm font-medium text-emerald-deep mb-2">
                    كلمة المرور
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        {...registerForm.register("password")}
                        placeholder="••••••••"
                        className="w-full px-4 py-4 pr-12 pl-12 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                        dir="ltr"
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-emerald transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {registerForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.password.message}
                    </p>
                )}
            </div>

            {/* Confirm Password */}
            <div>
                <label className="block text-sm font-medium text-emerald-deep mb-2">
                    تأكيد كلمة المرور
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        {...registerForm.register("confirmPassword")}
                        placeholder="••••••••"
                        className="w-full px-4 py-4 pr-12 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                        dir="ltr"
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                </div>
                {registerForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.confirmPassword.message}
                    </p>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    <AlertCircle size={18} />
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
                        إنشاء حساب
                        <ArrowLeft size={18} />
                    </>
                )}
            </motion.button>

            {/* Switch Mode */}
            <p className="text-center text-text-muted text-sm">
                لديك حساب بالفعل؟{" "}
                <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-emerald font-medium hover:text-emerald-deep transition-colors"
                >
                    تسجيل الدخول
                </button>
            </p>
        </form>
    );
}

// ========================
// Google Sign-In Button
// ========================

function GoogleSignInButton() {
    const router = useRouter();
    const { isLoading, error, signInWithGoogle, clearError } = useGoogleAuth();
    const { user } = useAuth();

    // Handle redirect after auth
    useEffect(() => {
        if (user) {
            checkUserProfileExists(user.uid).then((exists) => {
                router.replace(exists ? "/app/dashboard" : "/onboarding");
            });
        }
    }, [user, router]);

    const handleClick = async () => {
        clearError();
        await signInWithGoogle();
    };

    // Map error messages to Arabic
    const getArabicError = (err: string) => {
        if (err.includes("popup-closed-by-user")) return "تم إغلاق نافذة تسجيل الدخول";
        if (err.includes("popup-blocked")) return "تم حظر النافذة المنبثقة. يرجى السماح بها";
        if (err.includes("cancelled-popup-request")) return "تم إلغاء طلب تسجيل الدخول";
        if (err.includes("network-request-failed")) return "فشل الاتصال بالشبكة. تحقق من اتصالك";
        return err;
    };

    return (
        <div className="space-y-3">
            <motion.button
                variants={buttonMotion}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={handleClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-border rounded-xl text-text font-medium hover:bg-sand transition-colors"
            >
                {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        تسجيل الدخول باستخدام Google
                    </>
                )}
            </motion.button>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    <AlertCircle size={18} />
                    {getArabicError(error)}
                </div>
            )}
        </div>
    );
}
