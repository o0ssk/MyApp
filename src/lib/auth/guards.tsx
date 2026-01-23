"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getDashboardRoute } from "@/lib/auth/hooks";

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireProfile?: boolean;
    allowedRoles?: ("student" | "sheikh")[];
}

/**
 * AuthGuard Component
 * 
 * Handles route protection and redirects:
 * - If requireAuth=true and not logged in → redirect to /login
 * - If logged in but no profile → redirect to /onboarding
 * - If role not in allowedRoles → redirect to correct dashboard
 */
export function AuthGuard({
    children,
    requireAuth = false,
    requireProfile = false,
    allowedRoles,
}: AuthGuardProps) {
    const router = useRouter();
    const { user, userProfile, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        // Not authenticated and auth required
        if (requireAuth && !isAuthenticated) {
            router.replace("/login");
            return;
        }

        // Authenticated but no profile and profile required
        if (requireProfile && isAuthenticated && !userProfile) {
            router.replace("/onboarding");
            return;
        }

        // Role-based access control
        if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
            router.replace(getDashboardRoute(userProfile.role));
            return;
        }
    }, [isLoading, isAuthenticated, userProfile, requireAuth, requireProfile, allowedRoles, router]);

    // Show loading state while checking auth
    if (isLoading) {
        return <AuthLoadingScreen />;
    }

    // Check if we need to redirect
    if (requireAuth && !isAuthenticated) {
        return <AuthLoadingScreen />;
    }

    if (requireProfile && isAuthenticated && !userProfile) {
        return <AuthLoadingScreen />;
    }

    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
        return <AuthLoadingScreen />;
    }

    return <>{children}</>;
}

/**
 * Guest Guard - Redirects authenticated users away from login/register pages
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, userProfile, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (isAuthenticated) {
            if (userProfile) {
                // Has profile, go to dashboard
                router.replace(getDashboardRoute(userProfile.role));
            } else {
                // No profile, go to onboarding
                router.replace("/onboarding");
            }
        }
    }, [isLoading, isAuthenticated, userProfile, router]);

    if (isLoading) {
        return <AuthLoadingScreen />;
    }

    if (isAuthenticated) {
        return <AuthLoadingScreen />;
    }

    return <>{children}</>;
}

/**
 * Onboarding Guard - Only for authenticated users without profile
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, userProfile, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        if (userProfile) {
            // Already has profile, go to dashboard
            router.replace(getDashboardRoute(userProfile.role));
            return;
        }
    }, [isLoading, isAuthenticated, userProfile, router]);

    if (isLoading) {
        return <AuthLoadingScreen />;
    }

    if (!isAuthenticated || userProfile) {
        return <AuthLoadingScreen />;
    }

    return <>{children}</>;
}

/**
 * Loading Screen
 */
function AuthLoadingScreen() {
    return (
        <div className="min-h-screen bg-sand flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald/20 border-t-emerald rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-muted">جاري التحميل...</p>
            </div>
        </div>
    );
}
