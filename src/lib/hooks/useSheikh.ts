"use client";

import { useState, useEffect, useCallback } from "react";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/hooks";

// Types
export interface Circle {
    id: string;
    name: string;
    description?: string;
    teacherId: string;
    inviteCode: string;
    schedule?: string;
    assistants?: string[];
    createdAt: Date;
    updatedAt: Date;
    memberCount?: number;
    pendingCount?: number;
}

export interface CircleMember {
    id: string;
    circleId: string;
    userId: string;
    roleInCircle: "student" | "assistant";
    status: "pending" | "approved" | "removed";
    joinedAt: Date | null;
    approvedAt?: Date;
    userName?: string;
    userAvatar?: string;
}

export interface PendingLog {
    id: string;
    circleId: string;
    studentId: string;
    studentName?: string;
    date: Date;
    type: "memorization" | "revision";
    amount: {
        pages?: number;
        surah?: string;
        ayahFrom?: number;
        ayahTo?: number;
    };
    status: "pending_approval" | "approved" | "rejected";
    studentNotes?: string;
    teacherNotes?: string;
    taskId?: string;
    createdAt: Date;
}

// Generate unique invite code
function generateInviteCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Helper to parse date (could be Timestamp, string, or Date)
function parseDate(value: any): Date {
    if (!value) return new Date();
    if (value.toDate && typeof value.toDate === "function") {
        return value.toDate();
    }
    if (typeof value === "string") {
        return new Date(value);
    }
    if (value instanceof Date) {
        return value;
    }
    return new Date();
}

// Fetch user info helper
async function fetchUserInfo(userId: string): Promise<{ name: string; avatar?: string }> {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return { name: data.name || "طالب", avatar: data.avatar };
        }
    } catch (err) {
        console.error("Error fetching user info:", err);
    }
    return { name: "طالب" };
}

// Hook: Fetch circles for current sheikh
export function useSheikhCircles() {
    const { user } = useAuth();
    const [circles, setCircles] = useState<Circle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const uid = user?.uid;
        if (!uid) {
            setCircles([]);
            setIsLoading(false);
            return;
        }

        const circlesRef = collection(db, "circles");
        const q = query(
            circlesRef,
            where("teacherId", "==", uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const circlesData: Circle[] = snapshot.docs.map((d) => ({
                    id: d.id,
                    name: d.data().name,
                    description: d.data().description,
                    teacherId: d.data().teacherId,
                    inviteCode: d.data().inviteCode,
                    schedule: d.data().schedule,
                    assistants: d.data().assistants,
                    createdAt: d.data().createdAt?.toDate() || new Date(),
                    updatedAt: d.data().updatedAt?.toDate() || new Date(),
                }));
                setCircles(circlesData);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Circles error:", err);
                setError("فشل في تحميل الحلقات");
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user?.uid]);

    // Create circle
    const createCircle = async (data: {
        name: string;
        description?: string;
        schedule?: string;
    }): Promise<{ success: boolean; circleId?: string; error?: string }> => {
        if (!user) return { success: false, error: "يجب تسجيل الدخول" };

        try {
            const inviteCode = generateInviteCode();
            const circleDoc = await addDoc(collection(db, "circles"), {
                name: data.name,
                description: data.description || "",
                schedule: data.schedule || "",
                teacherId: user.uid,
                inviteCode,
                assistants: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return { success: true, circleId: circleDoc.id };
        } catch (err: any) {
            console.error("Create circle error:", err);
            return { success: false, error: "فشل في إنشاء الحلقة" };
        }
    };

    // Update circle
    const updateCircle = async (
        circleId: string,
        data: Partial<{ name: string; description: string; schedule: string }>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, "circles", circleId), {
                ...data,
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (err: any) {
            console.error("Update circle error:", err);
            return { success: false, error: "فشل في تحديث الحلقة" };
        }
    };

    return { circles, isLoading, error, createCircle, updateCircle };
}

// Hook: Fetch members for a circle
export function useCircleMembers(circleId: string | null) {
    const [members, setMembers] = useState<CircleMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!circleId) {
            setMembers([]);
            setIsLoading(false);
            return;
        }

        const membersRef = collection(db, "circleMembers");
        const q = query(membersRef, where("circleId", "==", circleId));

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                const membersData: CircleMember[] = [];

                for (const d of snapshot.docs) {
                    const data = d.data();
                    const userInfo = await fetchUserInfo(data.userId);

                    membersData.push({
                        id: d.id,
                        circleId: data.circleId,
                        userId: data.userId,
                        roleInCircle: data.roleInCircle,
                        status: data.status,
                        joinedAt: data.joinedAt?.toDate() || null,
                        approvedAt: data.approvedAt?.toDate(),
                        userName: userInfo.name,
                        userAvatar: userInfo.avatar,
                    });
                }

                setMembers(membersData);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Members error:", err);
                setError("فشل في تحميل الأعضاء");
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [circleId]);

    // Approve member
    const approveMember = async (memberId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, "circleMembers", memberId), {
                status: "approved",
                approvedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (err: any) {
            console.error("Approve member error:", err);
            return { success: false, error: "فشل في قبول الطالب" };
        }
    };

    // Reject member
    const rejectMember = async (memberId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, "circleMembers", memberId), {
                status: "removed",
            });
            return { success: true };
        } catch (err: any) {
            console.error("Reject member error:", err);
            return { success: false, error: "فشل في رفض الطالب" };
        }
    };

    const pendingMembers = members.filter((m) => m.status === "pending");
    const approvedMembers = members.filter((m) => m.status === "approved");

    return {
        members,
        pendingMembers,
        approvedMembers,
        isLoading,
        error,
        approveMember,
        rejectMember,
    };
}

// Hook: Fetch pending logs for approval
export function usePendingLogs(circleIds: string[]) {
    const [logs, setLogs] = useState<PendingLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (circleIds.length === 0) {
            setLogs([]);
            setIsLoading(false);
            return;
        }

        const logsRef = collection(db, "logs");
        const q = query(
            logsRef,
            where("circleId", "in", circleIds.slice(0, 10)), // Firestore limit
            where("status", "==", "pending_approval"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                const logsData: PendingLog[] = [];

                for (const d of snapshot.docs) {
                    const data = d.data();
                    const userInfo = await fetchUserInfo(data.studentId);

                    logsData.push({
                        id: d.id,
                        circleId: data.circleId,
                        studentId: data.studentId,
                        studentName: userInfo.name,
                        date: parseDate(data.date),
                        type: data.type,
                        amount: data.amount,
                        status: data.status,
                        studentNotes: data.studentNotes,
                        teacherNotes: data.teacherNotes,
                        taskId: data.taskId,
                        createdAt: parseDate(data.createdAt),
                    });
                }

                setLogs(logsData);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Pending logs error:", err);
                setError("فشل في تحميل السجلات");
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [circleIds.join(",")]);

    // Approve log
    const approveLog = async (
        logId: string,
        teacherNotes: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, "logs", logId), {
                status: "approved",
                teacherNotes,
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (err: any) {
            console.error("Approve log error:", err);
            return { success: false, error: "فشل في اعتماد السجل" };
        }
    };

    // Reject log
    const rejectLog = async (
        logId: string,
        teacherNotes: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await updateDoc(doc(db, "logs", logId), {
                status: "rejected",
                teacherNotes,
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (err: any) {
            console.error("Reject log error:", err);
            return { success: false, error: "فشل في رفض السجل" };
        }
    };

    return { logs, isLoading, error, approveLog, rejectLog };
}
