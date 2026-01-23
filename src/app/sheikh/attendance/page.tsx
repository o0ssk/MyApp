"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/hooks";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import AttendanceSheet from "@/components/sheikh/AttendanceSheet";
import { AttendanceAnalytics } from "@/components/sheikh/AttendanceAnalytics";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

export default function AttendancePage() {
    const { user, isLoading: authLoading } = useAuth();
    const [circleId, setCircleId] = useState<string | null>(null);
    const [circleName, setCircleName] = useState<string>("");
    const [checkingCircle, setCheckingCircle] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        async function fetchMyCircle() {
            if (authLoading) return;
            if (!user) {
                setCheckingCircle(false);
                return;
            }

            console.log("🔍 Checking for circles for teacher:", user.uid);

            try {
                setCheckingCircle(true);
                // Query circles where this user is the sheikh (try both field names)
                let snapshot = await getDocs(
                    query(collection(db, "circles"), where("sheikhId", "==", user.uid))
                );

                // Fallback: try teacherId if sheikhId doesn't work
                if (snapshot.empty) {
                    console.log("🔄 Trying teacherId field...");
                    snapshot = await getDocs(
                        query(collection(db, "circles"), where("teacherId", "==", user.uid))
                    );
                }

                if (!snapshot.empty) {
                    const foundCircle = snapshot.docs[0];
                    const foundCircleId = foundCircle.id;
                    const foundCircleName = foundCircle.data().name || "حلقة";
                    console.log("✅ Found Circle:", foundCircleId, foundCircleName);
                    setCircleId(foundCircleId);
                    setCircleName(foundCircleName);
                } else {
                    console.warn("⚠️ No circles found for this teacher in Firestore.");
                }
            } catch (error) {
                console.error("🔥 Error fetching circle:", error);
            } finally {
                setCheckingCircle(false);
            }
        }

        fetchMyCircle();
    }, [user, authLoading, retryCount]);

    // 1. Loading State (Show this while checking auth OR querying Firestore)
    if (authLoading || checkingCircle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald" />
                <p className="text-text-muted animate-pulse">جاري البحث عن حلقتك...</p>
            </div>
        );
    }

    // 2. Empty State (Only show if we REALLY finished checking and found nothing)
    if (!circleId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-deep mb-3">لا توجد حلقة نشطة</h3>
                <p className="text-text-muted max-w-md mb-8 leading-relaxed">
                    لم نعثر على حلقة مرتبطة بحسابك الحالي. يجب أن تقوم بإنشاء حلقة أولاً لتتمكن من إدارة الحضور والطلاب.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={() => setRetryCount(c => c + 1)}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
                        تحديث الصفحة
                    </button>
                </div>

                <div className="mt-8 p-4 bg-sand rounded-lg text-xs text-left font-mono text-text-muted" dir="ltr">
                    DEBUG INFO:<br />
                    User ID: {user?.uid || 'Not Logged In'}<br />
                    Status: Checked
                </div>
            </div>
        );
    }

    // 3. Success State (Render the Sheet)
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-emerald-deep mb-2">دفتر التحضير</h1>
                <p className="text-text-muted">إدارة الحضور والغياب لـ ({circleName})</p>
            </div>

            {/* Analytics Section */}
            <div className="mb-8 bg-surface rounded-2xl shadow-soft border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                    <h2 className="font-bold text-emerald-deep">إحصائيات الحضور العامة</h2>
                </div>
                <AttendanceAnalytics circleId={circleId} />
            </div>

            {/* Attendance Sheet */}
            <div className="bg-surface rounded-2xl shadow-soft border border-border overflow-hidden p-4 md:p-6">
                <AttendanceSheet circleId={circleId} />
            </div>
        </div>
    );
}
