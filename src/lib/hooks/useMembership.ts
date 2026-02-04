"use client";

import { useState, useEffect } from "react";
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    addDoc,
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/hooks";

export interface CircleMembership {
    id: string;
    circleId: string;
    userId: string;
    status: "pending" | "approved" | "rejected";
    roleInCircle: "student";
    joinedAt: Date | null;
}

export interface Circle {
    id: string;
    name: string;
    sheikhIds: string[]; // Updated to array
    teacherId?: string; // Legacy
    inviteCode: string;
    settings?: Record<string, any>;
    schedule?: string;
}

export function useMembership() {
    const { user } = useAuth();
    const [memberships, setMemberships] = useState<CircleMembership[]>([]);
    const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setMemberships([]);
            setActiveCircle(null);
            setIsLoading(false);
            return;
        }

        const membershipsRef = collection(db, "circleMembers");
        const q = query(membershipsRef, where("userId", "==", user.uid));

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                const membershipData: CircleMembership[] = snapshot.docs.map((d) => ({
                    id: d.id,
                    circleId: d.data().circleId,
                    userId: d.data().userId,
                    status: d.data().status,
                    roleInCircle: d.data().roleInCircle,
                    joinedAt: d.data().joinedAt?.toDate() || null,
                }));

                setMemberships(membershipData);

                const approved = membershipData.find((m) => m.status === "approved");
                if (approved) {
                    try {
                        const circleSnap = await getDoc(doc(db, "circles", approved.circleId));
                        if (circleSnap.exists()) {
                            setActiveCircle({
                                id: circleSnap.id,
                                name: circleSnap.data().name || "حلقة",
                                sheikhIds: circleSnap.data().sheikhIds || (circleSnap.data().sheikhId ? [circleSnap.data().sheikhId] : [circleSnap.data().teacherId]),
                                teacherId: circleSnap.data().teacherId,
                                inviteCode: circleSnap.data().inviteCode,
                                settings: circleSnap.data().settings,
                                schedule: circleSnap.data().schedule,
                            });
                        }
                    } catch (err) {
                        console.error("Error fetching circle:", err);
                    }
                } else {
                    setActiveCircle(null);
                }

                setIsLoading(false);
            },
            (err) => {
                console.error("Membership error:", err);
                setError("فشل في تحميل بيانات العضوية");
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const joinCircleByCode = async (inviteCode: string): Promise<{ success: boolean; error?: string }> => {
        if (!user) return { success: false, error: "يجب تسجيل الدخول أولاً" };

        try {
            const circlesRef = collection(db, "circles");
            const q = query(circlesRef, where("inviteCode", "==", inviteCode.toUpperCase()));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return { success: false, error: "رمز الدعوة غير صحيح" };
            }

            const circleDoc = snapshot.docs[0];
            const circleId = circleDoc.id;

            const existing = memberships.find((m) => m.circleId === circleId);
            if (existing) {
                if (existing.status === "pending") return { success: false, error: "طلب الانضمام قيد المراجعة" };
                if (existing.status === "approved") return { success: false, error: "أنت عضو بالفعل" };
            }

            await addDoc(collection(db, "circleMembers"), {
                circleId,
                userId: user.uid,
                status: "pending",
                roleInCircle: "student",
                joinedAt: serverTimestamp(),
            });

            return { success: true };
        } catch (err: any) {
            console.error("Join circle error:", err);
            return { success: false, error: "حدث خطأ أثناء الانضمام" };
        }
    };

    const pendingMemberships = memberships.filter((m) => m.status === "pending");
    const approvedMemberships = memberships.filter((m) => m.status === "approved");

    return {
        memberships,
        activeCircle,
        pendingMemberships,
        approvedMemberships,
        hasApprovedMembership: approvedMemberships.length > 0,
        hasPendingMembership: pendingMemberships.length > 0,
        isLoading,
        error,
        joinCircleByCode,
    };
}
