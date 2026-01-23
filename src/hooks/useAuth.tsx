"use client";

import { useAuth as useAuthInternal } from "@/lib/auth/hooks";

// Re-export everything from the new auth hooks location
export {
    AuthProvider,
    useAuth,
    getDashboardRoute,
    usePhoneAuth,
    useEmailAuth,
    useGoogleAuth,
    createUserProfile,
    checkUserProfileExists
} from "@/lib/auth/hooks";
export type { UserRole, UserProfile } from "@/lib/auth/hooks";

// Dynamic dashboard route based on user role
export function useDashboardRoute(): string {
    const { userProfile } = useAuthInternal();
    if (userProfile?.role === "sheikh") {
        return "/sheikh/dashboard";
    }
    return "/app/dashboard";
}

