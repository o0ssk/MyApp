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
    writeBatch,
    increment,
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
    equippedBadge?: string; // Student's equipped badge
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
    points: number;
    totalPoints: number;
    equipped?: {
        frame?: string;
        badge?: string;
        avatar?: string;
    };
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
    status: "pending" | "submitted" | "completed" | "missed" | "assigned";
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
async function fetchUserInfo(userId: string): Promise<{ name: string; email?: string; avatar?: string; points?: number; equippedBadge?: string }> {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            console.log(`Fetched user ${userId}:`, { name: data.name, photoURL: data.photoURL });
            return {
                name: data.name || "طالب",
                email: data.email,
                avatar: data.photoURL || null, // Explicit null fallback
                points: data.points || 0,
                equippedBadge: data.equippedBadge,
            };
        }
    } catch (err) {
        console.error("Error fetching user info:", err);
    }
    return { name: "طالب" };
}

// Shared helper for removing a student from a circle
async function deleteStudentFromCircle(db: any, studentId: string, circleId: string): Promise<boolean> {
    try {
        // 1. Find and delete the circleMembers document (CRITICAL)
        const membersRef = collection(db, "circleMembers");
        const q = query(
            membersRef,
            where("userId", "==", studentId),
            where("circleId", "==", circleId)
        );
        const snapshot = await getDocs(q);

        // Delete membership records
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // 2. Try to update the user document (OPTIONAL / BEST EFFORT)
        try {
            const userRef = doc(db, "users", studentId);
            await updateDoc(userRef, { circleId: null });
        } catch (profileErr) {
            console.warn("Could not unlink circleId from user profile (permission denied), but removal succeeded.", profileErr);
        }

        return true;
    } catch (err: any) {
        console.error("Error removing student:", err);
        throw err;
    }
}

// Hook: Fetch all students across sheikh's circles
// Accepts a single circleId string OR an array of circleIds for flexibility
export function useSheikhStudents(circleIdInput: string | string[]) {
    // Normalize to array
    const circleIds = Array.isArray(circleIdInput) ? circleIdInput : [circleIdInput].filter(Boolean);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stable dependency key for circleIds array
    const circleIdsKey = circleIds.join(",");

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
                                equippedBadge: userInfo.equippedBadge,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [circleIdsKey]);

    const removeStudent = async (studentId: string, circleId: string) => {
        if (!confirm("هل أنت متأكد من حذف الطالب من الحلقة؟")) return;

        try {
            await deleteStudentFromCircle(db, studentId, circleId);
            setStudents((prev) => prev.filter((s) => s.odeiUserId !== studentId)); // Note: filtering by userId as checking ID might be tricky if not consistent
            return true;
        } catch (err: any) {
            setError(`فشل في حذف الطالب: ${err.message || "خطأ غير معروف"}`);
            return false;
        }
    };

    return { students, isLoading, error, removeStudent };
}

// Hook: Fetch single student detail with logs and tasks
export function useStudentDetail(studentId: string | null) {
    const { user } = useAuth();
    const [student, setStudent] = useState<StudentDetail | null>(null);

    // 1. QUERY STATE: Separate state for each collection to ensure independence
    const [rawLogs, setRawLogs] = useState<StudentLog[]>([]);
    const [rawTasks, setRawTasks] = useState<StudentTask[]>([]);

    // 2. UI STATE: Merged and filtered results for the UI
    const [logs, setLogs] = useState<StudentLog[]>([]);
    const [tasks, setTasks] = useState<StudentTask[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Effect 0: Listen to Student Profile (Real-time)
    useEffect(() => {
        if (!studentId) {
            setStudent(null);
            setRawLogs([]);
            setRawTasks([]);
            setLogs([]);
            setTasks([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const userRef = doc(db, "users", studentId);

        const unsubscribe = onSnapshot(userRef, async (userSnap) => {
            try {
                if (userSnap.exists()) {
                    const userData = userSnap.data();

                    // Fetch Connection/Circle Info (One-time fetch per update is okay)
                    let circleName = "";
                    let circleId = "";
                    let joinedAt = null;

                    try {
                        const membersRef = collection(db, "circleMembers");
                        const memberQuery = query(
                            membersRef,
                            where("userId", "==", studentId),
                            where("status", "==", "approved"),
                            limit(1)
                        );
                        const memberSnap = await getDocs(memberQuery);

                        if (!memberSnap.empty) {
                            const memberData = memberSnap.docs[0].data();
                            joinedAt = parseDate(memberData.approvedAt) || parseDate(memberData.joinedAt);

                            if (memberData.circleId) {
                                circleId = memberData.circleId;
                                const circleDoc = await getDoc(doc(db, "circles", circleId));
                                if (circleDoc.exists()) {
                                    circleName = circleDoc.data().name;
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Error fetching circle info for student:", err);
                    }

                    setStudent({
                        id: studentId,
                        name: userData.name || "طالب",
                        email: userData.email,
                        avatar: userData.photoURL,
                        circleId,
                        circleName: circleName || "بدون حلقة",
                        joinedAt: joinedAt, // Keep existing if valid
                        role: "student",
                        points: userData.points ?? 0,
                        totalPoints: userData.totalPoints ?? 0,
                        equipped: {
                            frame: userData.equippedFrame,
                            badge: userData.equippedBadge,
                            avatar: userData.equippedAvatar
                        }
                    } as StudentDetail);
                } else {
                    setError("لم يتم العثور على بيانات الطالب");
                }
            } catch (err) {
                console.error("Error processing student snapshot:", err);
                setError("فشل في تحميل بيانات الطالب");
            } finally {
                setIsLoading(false);
            }
        }, (err) => {
            console.error("Student listener error:", err);
            setError("فشل في الاتصال بقاعدة البيانات");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [studentId]);

    // 4. Compatibility Stub (Real-time handles updates now)
    const refreshStudent = async () => { };

    // Effect 1: Query 'logs' collection (Realtime)
    useEffect(() => {
        if (!studentId || !db) return;

        // Query: Fetch ALL logs for this student
        const logsRef = collection(db, "logs");
        const logsQuery = query(
            logsRef,
            where("studentId", "==", studentId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
            const parsedLogs: StudentLog[] = snapshot.docs.map((d) => ({
                id: d.id,
                date: parseDate(d.data().date),
                type: d.data().type,
                amount: d.data().amount,
                status: d.data().status,
                studentNotes: d.data().studentNotes,
                teacherNotes: d.data().teacherNotes,
                pointsAwarded: d.data().pointsAwarded,
                createdAt: d.data().createdAt?.toDate() || new Date(),
            }));
            console.log("Fetched Logs:", parsedLogs.length);
            setRawLogs(parsedLogs);
        }, (err) => console.error("Logs listener error:", err));

        return () => unsubscribe();
    }, [studentId]);

    // Effect 2: Query 'tasks' collection (Realtime)
    useEffect(() => {
        if (!studentId || !db) return;

        // Query: Fetch ALL tasks for this student
        const tasksRef = collection(db, "tasks");
        const tasksQuery = query(
            tasksRef,
            where("studentId", "==", studentId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
            const parsedTasks: StudentTask[] = snapshot.docs.map((d) => ({
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
            console.log("Fetched Tasks:", parsedTasks.length);
            setRawTasks(parsedTasks);

            // Sync UI tasks state immediately
            setTasks(parsedTasks);
        }, (err) => console.error("Tasks listener error:", err));

        return () => unsubscribe();
    }, [studentId]);

    // Effect 3: Merge Logs & Tasks for UI
    useEffect(() => {
        // Convert Tasks to Log-like format for the history list
        // Only show COMPLETED tasks in the history
        const completedTaskLogs: StudentLog[] = rawTasks
            .filter(t => t.status === "completed")
            .map(t => ({
                id: t.id,
                date: new Date(t.dueDate), // Use due date as the log date
                type: t.type,
                amount: t.target,
                status: "approved", // Tasks marked completed are considered approved/done
                createdAt: t.createdAt,
            }));

        // Merge raw logs + completed tasks
        const merged = [...rawLogs, ...completedTaskLogs].sort((a, b) =>
            b.createdAt.getTime() - a.createdAt.getTime()
        );

        setLogs(merged);
    }, [rawLogs, rawTasks]);

    // Derived: Pending Tasks
    const completedTasks = rawTasks.filter(t => t.status === "completed");
    const pendingTasks = rawTasks.filter(t => t.status !== "completed");

    const removeStudent = async (): Promise<boolean> => {
        if (!student || !student.circleId) return false;
        try {
            await deleteStudentFromCircle(db, studentId!, student.circleId);
            return true;
        } catch (err: any) {
            setError(`فشل في حذف الطالب: ${err.message || "خطأ غير معروف"}`);
            return false;
        }
    };

    const approveLogWithPoints = async (logId: string, studentId: string, logData: StudentLog): Promise<number | false> => {
        if (!studentId || !logId) return false;

        try {
            const batch = writeBatch(db);
            const logRef = doc(db, "logs", logId);
            const userRef = doc(db, "users", studentId);

            // 1. Strict Parsing & Fail-Safe Logic
            const rawPages = logData?.amount?.pages;
            // Force strict number conversion. If NaN or <= 0, DEFAULT TO 1.
            // This guarantees points are ALWAYS added for an approved log.
            const pages = (Number(rawPages) > 0) ? Number(rawPages) : 1;

            // 2. Calculate Points (New Gamification Formula)
            // Memorization (Hifz) = pages × 3 points
            // Review (Muraja'ah) = pages × 1 point
            const isMemorization = logData?.type === "memorization";
            const pointsPerPage = isMemorization ? 3 : 1;
            const pointsToAdd = pages * pointsPerPage;

            console.log(`[Points System] 💰 Adding ${pointsToAdd} points to student ${studentId} (Pages: ${pages}, Type: ${logData?.type}, Rate: ${pointsPerPage}pts/page)`);

            // 3. Batch Update with ATOMIC INCREMENT (Critical)
            // A. Update Log Status
            batch.update(logRef, {
                status: "approved",
                pointsAwarded: pointsToAdd,
                approvedAt: serverTimestamp()
            });

            // B. Increment User Points safely
            batch.update(userRef, {
                points: increment(pointsToAdd),
                totalPoints: increment(pointsToAdd)
            });

            await batch.commit();
            return pointsToAdd; // Return actual points added for UI feedback
        } catch (err: any) {
            console.error("Error approving log with points:", err);
            setError("فشل في اعتماد السجل وإضافة النقاط");
            return false;
        }
    };

    return {
        student,
        logs,           // Contains Merged History (Logs + Assignments)
        tasks,          // Contains Raw Tasks
        pendingTasks,   // Visible in "Assigned Tasks" card
        completedTasks,
        isLoading,
        isLoadingMore: false,
        hasMoreLogs: false,
        loadMoreLogs: async () => { },
        error,
        removeStudent,
        approveLogWithPoints,
        refreshStudent,
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
