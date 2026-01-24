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
    const [checkingCircle, setCheckingCircle] = useState(true);

    // 📅 هذا هو "المايسترو"! التاريخ الموحد للصفحة كلها
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        async function fetchMyCircle() {
            if (authLoading) return;
            if (!user) {
                setCheckingCircle(false);
                return;
            }

            try {
                setCheckingCircle(true);
                // Query circles where this user is the teacher
                const q = query(
                    collection(db, "circles"),
                    where("teacherId", "==", user.uid)
                );

                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    setCircleId(snapshot.docs[0].id);
                } else {
                    // Fallback: try sheikhId if teacherId doesn't work (for older circles)
                    const q2 = query(
                        collection(db, "circles"),
                        where("sheikhId", "==", user.uid)
                    );
                    const snapshot2 = await getDocs(q2);
                    if (!snapshot2.empty) {
                        setCircleId(snapshot2.docs[0].id);
                    }
                }
            } catch (error) {
                console.error("Error fetching circle:", error);
            } finally {
                setCheckingCircle(false);
            }
        }

        fetchMyCircle();
    }, [user, authLoading]);

    if (authLoading || checkingCircle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald" />
                <p className="text-text-muted animate-pulse">جاري تحميل بيانات الحلقة...</p>
            </div>
        );
    }

    if (!circleId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-emerald-deep">لا توجد حلقة نشطة</h3>
                <p className="text-text-muted mt-2">يرجى إنشاء حلقة أولاً.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 btn-secondary flex items-center gap-2 mx-auto"
                >
                    <RefreshCw size={18} />
                    تحديث الصفحة
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-emerald-deep mb-2">دفتر التحضير</h1>
                <p className="text-text-muted">إدارة الحضور والغياب اليومي</p>
            </div>

            {/* 1. الرسم البياني (يستقبل التاريخ الموحد) */}
            <AttendanceAnalytics circleId={circleId} date={selectedDate} />

            {/* 2. جدول التحضير (يستقبل التاريخ ويستطيع تغييره) */}
            <div className="bg-surface rounded-3xl shadow-soft border border-border overflow-hidden p-4 md:p-6">
                {/* ملاحظة: تأكد أن AttendanceSheet تم تعديله ليقبل date و setDate كما سأشرح في الخطوة القادمة */}
                <AttendanceSheet
                    circleId={circleId}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                />
            </div>
        </div>
    );
}
