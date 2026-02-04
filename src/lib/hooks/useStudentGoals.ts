"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface StudentGoals {
    dailyMemoTarget?: number;
    dailyReviewTarget?: number;
    monthlyMemoTarget?: number;
    monthlyReviewTarget?: number;
}

export function useStudentGoals(studentId?: string) {
    const [goals, setGoals] = useState<StudentGoals>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!studentId) {
            setGoals({});
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const userRef = doc(db, "users", studentId);

        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                // Safe access to nested properties
                const userSettings = data.settings || {};
                const userGoals = userSettings.goals || {};

                setGoals({
                    dailyMemoTarget: userGoals.dailyMemoTarget,
                    dailyReviewTarget: userGoals.dailyReviewTarget,
                    monthlyMemoTarget: userGoals.monthlyMemoTarget,
                    monthlyReviewTarget: userGoals.monthlyReviewTarget,
                });
            } else {
                setGoals({});
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching student goals:", err);
            setError("فشل في تحميل الأهداف");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [studentId]);

    const updateGoals = async (newGoals: StudentGoals) => {
        if (!studentId) return { success: false, error: "No student ID provided" };

        try {
            const userRef = doc(db, "users", studentId);

            // Usage of setDoc with merge: true to perform a deep merge
            // ensuring we don't overwrite other settings like 'theme' or 'language'
            await setDoc(userRef, {
                settings: {
                    goals: newGoals
                }
            }, { merge: true });

            return { success: true };
        } catch (err: any) {
            console.error("Error updating goals:", err);
            return { success: false, error: "فشل في تحديث الأهداف" };
        }
    };

    return { goals, isLoading, error, updateGoals };
}
