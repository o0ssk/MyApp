"use client";

import { useState, useEffect, useCallback } from "react";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    writeBatch,
    orderBy,
    Timestamp,
    addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/hooks";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export interface AttendanceRecord {
    id: string; // circleId_date_studentId
    date: string; // YYYY-MM-DD format
    studentId: string;
    circleId: string;
    status: AttendanceStatus;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export type ExcuseStatus = "pending" | "approved" | "rejected";

export interface Excuse {
    id: string;
    studentId: string;
    studentName?: string;
    date: string; // YYYY-MM-DD format
    reason: string;
    status: ExcuseStatus;
    circleId: string;
    createdAt?: Timestamp;
    processedAt?: Timestamp;
    processedBy?: string;
}

export interface AttendanceStats {
    totalDays: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    attendanceRate: number; // percentage
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Generate composite key for attendance document
 */
export function getAttendanceId(circleId: string, date: string, studentId: string): string {
    return `${circleId}_${date}_${studentId}`;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
    return date.toISOString().split("T")[0];
}

/**
 * Parse date from YYYY-MM-DD string
 */
export function parseDateKey(dateKey: string): Date {
    return new Date(dateKey + "T00:00:00");
}

/**
 * Get last N days as date keys
 */
export function getLastNDays(n: number): string[] {
    const days: string[] = [];
    const today = new Date();
    for (let i = 0; i < n; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        days.push(formatDateKey(date));
    }
    return days;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useAttendance(circleId?: string) {
    const { user, userProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SHEIKH FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Fetch daily attendance for a specific date
     * Returns a map of studentId -> AttendanceRecord
     */
    const fetchDailyAttendance = useCallback(
        async (date: string): Promise<Map<string, AttendanceRecord>> => {
            if (!circleId) {
                return new Map();
            }

            setIsLoading(true);
            setError(null);

            try {
                const attendanceRef = collection(db, "attendance");
                const q = query(
                    attendanceRef,
                    where("circleId", "==", circleId),
                    where("date", "==", date)
                );

                const snapshot = await getDocs(q);
                const records = new Map<string, AttendanceRecord>();

                snapshot.docs.forEach((doc) => {
                    const data = doc.data() as AttendanceRecord;
                    records.set(data.studentId, { ...data, id: doc.id });
                });

                return records;
            } catch (err) {
                console.error("Error fetching attendance:", err);
                setError("فشل في جلب بيانات الحضور");
                return new Map();
            } finally {
                setIsLoading(false);
            }
        },
        [circleId]
    );

    /**
     * Save attendance records for multiple students using batch write
     */
    const saveAttendance = useCallback(
        async (
            date: string,
            records: { studentId: string; status: AttendanceStatus }[]
        ): Promise<boolean> => {
            if (!circleId) {
                setError("لم يتم تحديد الحلقة");
                return false;
            }

            setIsLoading(true);
            setError(null);

            try {
                const batch = writeBatch(db);

                for (const record of records) {
                    const docId = getAttendanceId(circleId, date, record.studentId);
                    const docRef = doc(db, "attendance", docId);

                    const attendanceData: Omit<AttendanceRecord, "id"> = {
                        date,
                        studentId: record.studentId,
                        circleId,
                        status: record.status,
                        updatedAt: Timestamp.now(),
                    };

                    // Check if document exists
                    const existingDoc = await getDoc(docRef);
                    if (!existingDoc.exists()) {
                        (attendanceData as any).createdAt = Timestamp.now();
                    }

                    batch.set(docRef, attendanceData, { merge: true });
                }

                await batch.commit();
                return true;
            } catch (err) {
                console.error("Error saving attendance:", err);
                setError("فشل في حفظ الحضور");
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [circleId]
    );

    /**
     * Fetch pending excuses for Sheikh review
     */
    const fetchPendingExcuses = useCallback(
        async (): Promise<Excuse[]> => {
            if (!circleId) {
                return [];
            }

            setIsLoading(true);
            setError(null);

            try {
                const excusesRef = collection(db, "excuses");
                const q = query(
                    excusesRef,
                    where("circleId", "==", circleId),
                    where("status", "==", "pending"),
                    orderBy("createdAt", "desc")
                );

                const snapshot = await getDocs(q);
                return snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as Excuse));
            } catch (err) {
                console.error("Error fetching excuses:", err);
                setError("فشل في جلب الأعذار");
                return [];
            } finally {
                setIsLoading(false);
            }
        },
        [circleId]
    );

    /**
     * Process an excuse (approve or reject)
     */
    const processExcuse = useCallback(
        async (excuseId: string, action: "approved" | "rejected"): Promise<boolean> => {
            if (!user?.uid) {
                setError("يجب تسجيل الدخول");
                return false;
            }

            setIsLoading(true);
            setError(null);

            try {
                const excuseRef = doc(db, "excuses", excuseId);
                const excuseSnap = await getDoc(excuseRef);

                if (!excuseSnap.exists()) {
                    setError("العذر غير موجود");
                    return false;
                }

                const excuseData = excuseSnap.data() as Excuse;
                const batch = writeBatch(db);

                // Update excuse status
                batch.update(excuseRef, {
                    status: action,
                    processedAt: Timestamp.now(),
                    processedBy: user.uid,
                });

                // If approved, update attendance to 'excused'
                if (action === "approved") {
                    const attendanceId = getAttendanceId(
                        excuseData.circleId,
                        excuseData.date,
                        excuseData.studentId
                    );
                    const attendanceRef = doc(db, "attendance", attendanceId);

                    batch.set(
                        attendanceRef,
                        {
                            date: excuseData.date,
                            studentId: excuseData.studentId,
                            circleId: excuseData.circleId,
                            status: "excused" as AttendanceStatus,
                            updatedAt: Timestamp.now(),
                        },
                        { merge: true }
                    );
                }

                await batch.commit();
                return true;
            } catch (err) {
                console.error("Error processing excuse:", err);
                setError("فشل في معالجة العذر");
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [user?.uid]
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STUDENT FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Submit an excuse for a specific date
     */
    const submitExcuse = useCallback(
        async (date: string, reason: string): Promise<boolean> => {
            if (!user?.uid || !circleId) {
                setError("يجب تسجيل الدخول واختيار الحلقة");
                return false;
            }

            setIsLoading(true);
            setError(null);

            try {
                const excuseData: Omit<Excuse, "id"> = {
                    studentId: user.uid,
                    studentName: userProfile?.name || "طالب",
                    date,
                    reason,
                    status: "pending",
                    circleId,
                    createdAt: Timestamp.now(),
                };

                await addDoc(collection(db, "excuses"), excuseData);
                return true;
            } catch (err) {
                console.error("Error submitting excuse:", err);
                setError("فشل في تقديم العذر");
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [user?.uid, circleId, userProfile?.name]
    );

    /**
     * Fetch student's personal attendance history
     */
    const fetchMyAttendance = useCallback(
        async (days: number = 7): Promise<AttendanceRecord[]> => {
            if (!user?.uid || !circleId) {
                return [];
            }

            setIsLoading(true);
            setError(null);

            try {
                const dateKeys = getLastNDays(days);
                const attendanceRef = collection(db, "attendance");
                const q = query(
                    attendanceRef,
                    where("circleId", "==", circleId),
                    where("studentId", "==", user.uid),
                    where("date", "in", dateKeys)
                );

                const snapshot = await getDocs(q);
                return snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as AttendanceRecord));
            } catch (err) {
                console.error("Error fetching my attendance:", err);
                setError("فشل في جلب سجل الحضور");
                return [];
            } finally {
                setIsLoading(false);
            }
        },
        [user?.uid, circleId]
    );

    /**
     * Fetch student's excuses
     */
    const fetchMyExcuses = useCallback(
        async (): Promise<Excuse[]> => {
            if (!user?.uid || !circleId) {
                return [];
            }

            setIsLoading(true);
            setError(null);

            try {
                const excusesRef = collection(db, "excuses");
                const q = query(
                    excusesRef,
                    where("circleId", "==", circleId),
                    where("studentId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );

                const snapshot = await getDocs(q);
                return snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as Excuse));
            } catch (err) {
                console.error("Error fetching my excuses:", err);
                setError("فشل في جلب الأعذار");
                return [];
            } finally {
                setIsLoading(false);
            }
        },
        [user?.uid, circleId]
    );

    /**
     * Calculate attendance statistics
     */
    const calculateStats = useCallback((records: AttendanceRecord[]): AttendanceStats => {
        const stats: AttendanceStats = {
            totalDays: records.length,
            present: 0,
            late: 0,
            absent: 0,
            excused: 0,
            attendanceRate: 0,
        };

        records.forEach((record) => {
            switch (record.status) {
                case "present":
                    stats.present++;
                    break;
                case "late":
                    stats.late++;
                    break;
                case "absent":
                    stats.absent++;
                    break;
                case "excused":
                    stats.excused++;
                    break;
            }
        });

        // Calculate rate: (present + late + excused) / total * 100
        if (stats.totalDays > 0) {
            stats.attendanceRate = Math.round(
                ((stats.present + stats.late + stats.excused) / stats.totalDays) * 100
            );
        }

        return stats;
    }, []);

    /**
     * Check if there's a pending excuse for a specific student/date
     */
    const checkPendingExcuse = useCallback(
        async (studentId: string, date: string): Promise<Excuse | null> => {
            if (!circleId) {
                return null;
            }

            try {
                const excusesRef = collection(db, "excuses");
                const q = query(
                    excusesRef,
                    where("circleId", "==", circleId),
                    where("studentId", "==", studentId),
                    where("date", "==", date),
                    where("status", "==", "pending")
                );

                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    return null;
                }

                return {
                    id: snapshot.docs[0].id,
                    ...snapshot.docs[0].data(),
                } as Excuse;
            } catch (err) {
                console.error("Error checking pending excuse:", err);
                return null;
            }
        },
        [circleId]
    );

    return {
        isLoading,
        error,
        // Sheikh functions
        fetchDailyAttendance,
        saveAttendance,
        fetchPendingExcuses,
        processExcuse,
        checkPendingExcuse,
        // Student functions
        submitExcuse,
        fetchMyAttendance,
        fetchMyExcuses,
        // Utilities
        calculateStats,
    };
}
