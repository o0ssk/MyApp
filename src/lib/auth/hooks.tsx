"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    signInWithPhoneNumber,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    RecaptchaVerifier,
    ConfirmationResult,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, runTransaction, increment } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { getAuthErrorMessage } from "@/lib/auth/errors";

export type UserRole = "student" | "sheikh";

export interface UserProfile {
    uid: string;
    name: string;
    email?: string;
    phone?: string;
    photoURL?: string;
    role: UserRole;
    settings: {
        language: string;
        theme: string;
        fontSize: string;
        notifications: boolean;
        goals?: {
            monthlyPagesTarget?: number;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    signOut: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserProfile = useCallback(async (uid: string) => {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserProfile({
                    uid,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    photoURL: data.photoURL,
                    role: data.role,
                    settings: data.settings,
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate(),
                });
                return true;
            }
            return false;
        } catch (err) {
            console.error("Error fetching user profile:", err);
            return false;
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await fetchUserProfile(firebaseUser.uid);
            } else {
                setUserProfile(null);
            }
            setIsLoading(false);
        });

        getRedirectResult(auth).catch((err) => {
            if (err.code) {
                setError(getAuthErrorMessage(err.code));
            }
        });

        return () => unsubscribe();
    }, [fetchUserProfile]);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUserProfile(null);
        } catch (err: any) {
            setError(getAuthErrorMessage(err.code));
        }
    };

    const clearError = () => setError(null);

    const value: AuthContextType = {
        user,
        userProfile,
        isLoading,
        isAuthenticated: !!user,
        error,
        signOut,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function getDashboardRoute(role: UserRole): string {
    switch (role) {
        case "sheikh":
            return "/sheikh/dashboard";
        case "student":
        default:
            return "/app/dashboard";
    }
}

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier | undefined;
        confirmationResult: ConfirmationResult | undefined;
    }
}

export function usePhoneAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [codeSent, setCodeSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const initRecaptcha = useCallback((buttonId: string) => {
        if (typeof window === "undefined") return;
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = undefined;
        }
        try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
                size: "invisible",
                callback: () => { },
                "expired-callback": () => {
                    setError("انتهت صلاحية التحقق. يرجى المحاولة مرة أخرى.");
                },
            });
        } catch (err: any) {
            console.error("reCAPTCHA init error:", err);
            setError(getAuthErrorMessage(err.code));
        }
    }, []);

    const sendOTP = async (phoneNumber: string) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!window.recaptchaVerifier) {
                throw new Error("reCAPTCHA not initialized");
            }
            const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+966${phoneNumber.replace(/^0/, "")}`;
            const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
            window.confirmationResult = confirmationResult;
            setCodeSent(true);
            setResendTimer(60);
            const interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return true;
        } catch (err: any) {
            console.error("Send OTP error:", err);
            setError(getAuthErrorMessage(err.code));
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = undefined;
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOTP = async (code: string) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!window.confirmationResult) {
                throw new Error("No confirmation result");
            }
            await window.confirmationResult.confirm(code);
            return true;
        } catch (err: any) {
            console.error("Verify OTP error:", err);
            setError(getAuthErrorMessage(err.code));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setCodeSent(false);
        setError(null);
        setResendTimer(0);
        window.confirmationResult = undefined;
    };

    const clearError = () => setError(null);

    return { isLoading, error, codeSent, resendTimer, initRecaptcha, sendOTP, verifyOTP, resetState, clearError };
}

export function useEmailAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (err: any) {
            console.error("Email sign-in error:", err);
            setError(getAuthErrorMessage(err.code));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            return true;
        } catch (err: any) {
            console.error("Email sign-up error:", err);
            setError(getAuthErrorMessage(err.code));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await sendPasswordResetEmail(auth, email);
            return true;
        } catch (err: any) {
            console.error("Password reset error:", err);
            setError(getAuthErrorMessage(err.code));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    return { isLoading, error, signIn, signUp, resetPassword, clearError };
}

export function useGoogleAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signInWithGoogle = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope("email");
            provider.addScope("profile");
            provider.setCustomParameters({ prompt: "select_account" });
            try {
                await signInWithPopup(auth, provider);
                return true;
            } catch (popupError: any) {
                if (popupError.code === "auth/popup-blocked" || popupError.code === "auth/popup-closed-by-user") {
                    await signInWithRedirect(auth, provider);
                    return true;
                }
                throw popupError;
            }
        } catch (err: any) {
            console.error("Google sign-in error:", err);
            setError(getAuthErrorMessage(err.code));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    return { isLoading, error, signInWithGoogle, clearError };
}

export async function createUserProfile(
    uid: string,
    data: {
        name: string;
        email?: string;
        phone?: string;
        photoURL?: string;
        role: UserRole;
        settings?: Partial<UserProfile["settings"]>;
    }
) {
    const userRef = doc(db, "users", uid);
    const profileData = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        photoURL: data.photoURL || null,
        role: data.role,
        settings: {
            language: data.settings?.language || "ar",
            theme: data.settings?.theme || "light",
            fontSize: data.settings?.fontSize || "medium",
            notifications: data.settings?.notifications ?? true,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    await setDoc(userRef, profileData, { merge: true });
    return profileData;
}

export async function checkUserProfileExists(uid: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists();
}

// Teacher invite verification
export interface TeacherInviteResult {
    valid: boolean;
    error?: string;
}

export async function verifyTeacherInvite(code: string): Promise<TeacherInviteResult> {
    if (!code || code.trim().length === 0) {
        return { valid: false, error: "يرجى إدخال كود المعلم" };
    }

    try {
        const inviteRef = doc(db, "teacherInvites", code.trim().toUpperCase());
        const inviteDoc = await getDoc(inviteRef);

        if (!inviteDoc.exists()) {
            return { valid: false, error: "كود المعلم غير صحيح" };
        }

        const data = inviteDoc.data();

        if (!data.isActive) {
            return { valid: false, error: "هذا الكود غير مفعّل" };
        }

        // Check max uses if set
        if (data.maxUses !== undefined && data.maxUses !== null) {
            const usedCount = data.usedCount || 0;
            if (usedCount >= data.maxUses) {
                return { valid: false, error: "تم استنفاد هذا الكود" };
            }
        }

        return { valid: true };
    } catch (err) {
        console.error("Error verifying teacher invite:", err);
        return { valid: false, error: "حدث خطأ أثناء التحقق من الكود" };
    }
}

// Create teacher profile with atomic invite consumption
export async function createTeacherProfile(
    uid: string,
    data: {
        name: string;
        email?: string;
        phone?: string;
        photoURL?: string;
        settings?: Partial<UserProfile["settings"]>;
    },
    inviteCode: string
): Promise<{ success: boolean; error?: string }> {
    const code = inviteCode.trim().toUpperCase();
    const inviteRef = doc(db, "teacherInvites", code);
    const userRef = doc(db, "users", uid);

    try {
        await runTransaction(db, async (transaction) => {
            // Re-validate the invite within transaction
            const inviteDoc = await transaction.get(inviteRef);

            if (!inviteDoc.exists()) {
                throw new Error("كود المعلم غير صحيح");
            }

            const inviteData = inviteDoc.data();

            if (!inviteData.isActive) {
                throw new Error("هذا الكود غير مفعّل");
            }

            if (inviteData.maxUses !== undefined && inviteData.maxUses !== null) {
                const usedCount = inviteData.usedCount || 0;
                if (usedCount >= inviteData.maxUses) {
                    throw new Error("تم استنفاد هذا الكود");
                }
            }

            // Increment usage count
            transaction.update(inviteRef, {
                usedCount: increment(1),
            });

            // Create user profile with sheikh role
            const profileData = {
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                photoURL: data.photoURL || null,
                role: "sheikh",
                settings: {
                    language: data.settings?.language || "ar",
                    theme: data.settings?.theme || "light",
                    fontSize: data.settings?.fontSize || "medium",
                    notifications: data.settings?.notifications ?? true,
                },
                inviteCodeUsed: code,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            transaction.set(userRef, profileData, { merge: true });
        });

        return { success: true };
    } catch (err: any) {
        console.error("Error creating teacher profile:", err);
        return { success: false, error: err.message || "حدث خطأ أثناء إنشاء الحساب" };
    }
}
