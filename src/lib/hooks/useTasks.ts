"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/hooks";

export interface Task {
    id: string;
    circleId: string;
    studentId: string;
    dueDate: string;
    type: "memorization" | "revision";
    target: {
        pages?: number;
        surah?: string;
        ayahFrom?: number;
        ayahTo?: number;
    };
    status: "pending" | "submitted" | "approved" | "missed";
}

function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

export function useTasks(circleId: string | null) {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !circleId) {
            setTasks([]);
            setIsLoading(false);
            return;
        }

        const today = getToday();
        const tasksRef = collection(db, "tasks");
        const q = query(
            tasksRef,
            where("studentId", "==", user.uid),
            where("status", "==", "pending"),
            orderBy("dueDate", "asc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const tasksData: Task[] = snapshot.docs.map((d) => ({
                    id: d.id,
                    circleId: d.data().circleId,
                    studentId: d.data().studentId,
                    dueDate: d.data().dueDate,
                    type: d.data().type,
                    target: d.data().target || {},
                    status: d.data().status,
                }));

                setTasks(tasksData);
                setIsLoading(false);
            },
            (err) => {
                console.error("Tasks error:", err);
                setError("فشل في تحميل المهام");
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, circleId]);

    const submitTask = async (task: Task) => {
        if (!user) return { success: false, error: "يجب تسجيل الدخول" };

        try {
            // Create log entry for approval
            await addDoc(collection(db, "logs"), {
                studentId: user.uid,
                circleId: task.circleId,
                date: serverTimestamp(),
                type: task.type,
                amount: task.target,
                status: "pending_approval",
                taskId: task.id,
                createdAt: serverTimestamp()
            });

            // Update task status
            await updateDoc(doc(db, "tasks", task.id), {
                status: "submitted",
                submittedAt: serverTimestamp()
            });

            return { success: true };
        } catch (err) {
            console.error("Submit task error:", err);
            return { success: false, error: "فشل في تسجيل الإنجاز" };
        }
    };

    const memorizationTask = tasks.find((t) => t.type === "memorization");
    const revisionTask = tasks.find((t) => t.type === "revision");

    return { tasks, memorizationTask, revisionTask, isLoading, error, submitTask };
}
