"use client";

import { useState, useEffect, useCallback } from "react";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    Timestamp,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/hooks";

// Types
export interface Student {
    id: string;
    odeiUserId: string;
    odei: string;
    avatar?: string;
    circleName: string;
    circleId: string;
    joinedAt: Date | null;
    lastLogDate: Date | null;
    totalApprovedPages: number;
    isActive: boolean; // No logs in last 3 days = inactive
}

export interface StudentDetail {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    circleId: string;
    circleName: string;
    joinedAt: Date | null;
    role: string;
}

export interface StudentLog {
    id: string;
    date: Date;
    type: "memorization" | "revision";
    amount: {
        pages?: number;
        surah?: string;
        ayahFrom?: number;
        ayahTo?: number;
    };
    status: string;
    studentNotes?: string;
    teacherNotes?: string;
    createdAt: Date;
}

export interface StudentTask {
    id: string;
    circleId: string;
    studentId: string;
    teacherId: string;
    type: "memorization" | "revision";
    target: {
        surah?: string;
        ayahFrom?: number;
        ayahTo?: number;
        pages?: number;
    };
    dueDate: string; // YYYY-MM-DD
    status: "pending" | "submitted" | "completed" | "missed";
    notes?: string;
    createdAt: Date;
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
async function fetchUserInfo(userId: string): Promise<{ name: string; email?: string; avatar?: string }> {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            console.log(`Fetched user ${userId}:`, { name: data.name, photoURL: data.photoURL });
            return {
                name: data.name || "طالب",
                email: data.email,
                avatar: data.photoURL || null // Explicit null fallback
            };
        }
    } catch (err) {
        console.error("Error fetching user info:", err);
    }
    return { name: "طالب" };
}

// Hook: Fetch all students across sheikh's circles
export function useSheikhStudents(circleIds: string[]) {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (circleIds.length === 0) {
            setStudents([]);
            setIsLoading(false);
            return;
        }

        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const allStudents: Student[] = [];
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

                // Fetch circles for names
                const circleNames: Record<string, string> = {};
                for (const cid of circleIds) {
                    try {
                        const circleDoc = await getDoc(doc(db, "circles", cid));
                        if (circleDoc.exists()) {
                            circleNames[cid] = circleDoc.data().name;
                        }
                    } catch (e) {
                        console.error("Error fetching circle:", cid, e);
                    }
                }

                // Fetch members for each circle separately to avoid complex queries
                for (const circleId of circleIds.slice(0, 10)) {
                    try {
                        const membersRef = collection(db, "circleMembers");
                        const q = query(
                            membersRef,
                            where("circleId", "==", circleId),
                            where("status", "==", "approved")
                        );

                        const membersSnap = await getDocs(q);

                        for (const memberDoc of membersSnap.docs) {
                            const memberData = memberDoc.data();
                            const userInfo = await fetchUserInfo(memberData.userId);

                            allStudents.push({
                                id: memberDoc.id,
                                odeiUserId: memberData.userId,
                                odei: userInfo.name,
                                avatar: userInfo.avatar,
                                circleName: circleNames[circleId] || "حلقة",
                                circleId: circleId,
                                joinedAt: parseDate(memberData.approvedAt) || parseDate(memberData.joinedAt),
                                lastLogDate: null, // Simplified - skip log fetching to avoid index issues
                                totalApprovedPages: 0, // Simplified
                                isActive: true, // Default to active
                            });
                        }
                    } catch (e) {
                        console.error("Error fetching members for circle:", circleId, e);
                    }
                }

                setStudents(allStudents);
                setError(null);
            } catch (err: any) {
                console.error("Fetch students error:", err);
                setError("فشل في تحميل الطلاب");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, [circleIds.join(",")]);

    return { students, isLoading, error };
}

// Hook: Fetch single student detail with logs and tasks
export function useStudentDetail(studentId: string | null) {
    const { user } = useAuth();
    const [student, setStudent] = useState<StudentDetail | null>(null);
    const [logs, setLogs] = useState<StudentLog[]>([]);
    const [tasks, setTasks] = useState<StudentTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreLogs, setHasMoreLogs] = useState(true);
    const [lastLogDoc, setLastLogDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [error, setError] = useState<string | null>(null);

    const LOGS_PER_PAGE = 10;

    // Initial fetch
    useEffect(() => {
        if (!studentId) {
            setStudent(null);
            setLogs([]);
            setTasks([]);
            setIsLoading(false);
            return;
        }

        const fetchStudentDetail = async () => {
            try {
                setIsLoading(true);

                // Fetch user profile
                const userInfo = await fetchUserInfo(studentId);

                // Find membership to get circle info
                const membersRef = collection(db, "circleMembers");
                const memberQuery = query(
                    membersRef,
                    where("userId", "==", studentId),
                    where("status", "==", "approved"),
                    limit(1)
                );
                const memberSnap = await getDocs(memberQuery);
                const memberData = memberSnap.docs[0]?.data();

                let circleName = "";
                let circleId = "";
                if (memberData?.circleId) {
                    circleId = memberData.circleId;
                    const circleDoc = await getDoc(doc(db, "circles", memberData.circleId));
                    if (circleDoc.exists()) {
                        circleName = circleDoc.data().name;
                    }
                }

                setStudent({
                    id: studentId,
                    name: userInfo.name,
                    email: userInfo.email,
                    avatar: userInfo.avatar,
                    circleId,
                    circleName,
                    joinedAt: parseDate(memberData?.approvedAt) || parseDate(memberData?.joinedAt),
                    role: "student",
                });

                // Fetch initial logs
                const logsRef = collection(db, "logs");
                const logsQuery = query(
                    logsRef,
                    where("studentId", "==", studentId),
                    orderBy("createdAt", "desc"),
                    limit(LOGS_PER_PAGE)
                );
                const logsSnap = await getDocs(logsQuery);
                const logsData: StudentLog[] = logsSnap.docs.map((d) => ({
                    id: d.id,
                    date: parseDate(d.data().date),
                    type: d.data().type,
                    amount: d.data().amount,
                    status: d.data().status,
                    studentNotes: d.data().studentNotes,
                    teacherNotes: d.data().teacherNotes,
                    createdAt: d.data().createdAt?.toDate() || new Date(),
                }));

                setLogs(logsData);
                setLastLogDoc(logsSnap.docs[logsSnap.docs.length - 1] || null);
                setHasMoreLogs(logsSnap.docs.length === LOGS_PER_PAGE);

                setError(null);
            } catch (err: any) {
                console.error("Fetch student detail error:", err);
                setError("فشل في تحميل بيانات الطالب");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentDetail();
    }, [studentId]);

    // Fetch tasks with realtime updates
    useEffect(() => {
        if (!studentId) return;

        const tasksRef = collection(db, "tasks");
        const tasksQuery = query(
            tasksRef,
            where("studentId", "==", studentId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            tasksQuery,
            (snapshot) => {
                const tasksData: StudentTask[] = snapshot.docs.map((d) => ({
                    id: d.id,
                    circleId: d.data().circleId,
                    studentId: d.data().studentId,
                    teacherId: d.data().teacherId,
                    type: d.data().type,
                    target: d.data().target,
                    dueDate: d.data().dueDate,
                    status: d.data().status,
                    notes: d.data().notes,
                    createdAt: d.data().createdAt?.toDate() || new Date(),
                }));
                setTasks(tasksData);
            },
            (err) => {
                console.error("Tasks listener error:", err);
            }
        );

        return () => unsubscribe();
    }, [studentId]);

    // Load more logs
    const loadMoreLogs = useCallback(async () => {
        if (!studentId || !lastLogDoc || !hasMoreLogs || isLoadingMore) return;

        setIsLoadingMore(true);
        try {
            const logsRef = collection(db, "logs");
            const logsQuery = query(
                logsRef,
                where("studentId", "==", studentId),
                orderBy("createdAt", "desc"),
                startAfter(lastLogDoc),
                limit(LOGS_PER_PAGE)
            );
            const logsSnap = await getDocs(logsQuery);
            const newLogs: StudentLog[] = logsSnap.docs.map((d) => ({
                id: d.id,
                date: d.data().date?.toDate() || new Date(),
                type: d.data().type,
                amount: d.data().amount,
                status: d.data().status,
                studentNotes: d.data().studentNotes,
                teacherNotes: d.data().teacherNotes,
                createdAt: d.data().createdAt?.toDate() || new Date(),
            }));

            setLogs((prev) => [...prev, ...newLogs]);
            setLastLogDoc(logsSnap.docs[logsSnap.docs.length - 1] || null);
            setHasMoreLogs(logsSnap.docs.length === LOGS_PER_PAGE);
        } catch (err) {
            console.error("Load more logs error:", err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [studentId, lastLogDoc, hasMoreLogs, isLoadingMore]);

    const pendingTasks = tasks.filter((t) => t.status === "pending");
    const completedTasks = tasks.filter((t) => t.status === "completed" || t.status === "submitted");

    return {
        student,
        logs,
        tasks,
        pendingTasks,
        completedTasks,
        isLoading,
        isLoadingMore,
        hasMoreLogs,
        loadMoreLogs,
        error,
    };
}

// Hook: Assign task to student
export function useAssignTask() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const assignTask = async (data: {
        studentId: string;
        circleId: string;
        type: "memorization" | "revision";
        target: {
            surah?: string;
            ayahFrom?: number;
            ayahTo?: number;
            pages?: number;
        };
        dueDate: string;
        notes?: string;
    }): Promise<{ success: boolean; taskId?: string; error?: string }> => {
        if (!user) return { success: false, error: "يجب تسجيل الدخول" };

        setIsLoading(true);
        setError(null);

        try {
            const taskDoc = await addDoc(collection(db, "tasks"), {
                circleId: data.circleId,
                studentId: data.studentId,
                teacherId: user.uid,
                type: data.type,
                target: data.target,
                dueDate: data.dueDate,
                status: "pending",
                notes: data.notes || "",
                createdAt: serverTimestamp(),
            });

            return { success: true, taskId: taskDoc.id };
        } catch (err: any) {
            console.error("Assign task error:", err);
            const errMsg = "فشل في إسناد المهمة";
            setError(errMsg);
            return { success: false, error: errMsg };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteTask = async (taskId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await deleteDoc(doc(db, "tasks", taskId));
            return { success: true };
        } catch (err: any) {
            console.error("Delete task error:", err);
            return { success: false, error: "فشل في حذف المهمة" };
        }
    };

    return { assignTask, deleteTask, isLoading, error };
}
