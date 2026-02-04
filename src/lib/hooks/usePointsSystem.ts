import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import {
    doc,
    onSnapshot,
    writeBatch,
    runTransaction,
    increment,
    serverTimestamp,
    collection
} from "firebase/firestore";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POINTS CALCULATION - Gamification Formula
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Points multiplier per page based on activity type
 * Memorization (Hifz) is rewarded more than Review (Muraja'ah)
 */
export const POINTS_PER_PAGE = {
    memorization: 3,  // 🎯 Hifz: 3 points per page
    review: 1,        // 📖 Muraja'ah: 1 point per page
    activity: 1,      // 🎮 Default for other activities
} as const;

/**
 * Calculate points based on activity type and pages count
 * 
 * @param type - 'memorization' | 'review' | 'activity'
 * @param pagesCount - Number of pages completed
 * @returns Total points to award
 * 
 * @example
 * calculatePointsForLog('memorization', 5) // Returns 15 (5 × 3)
 * calculatePointsForLog('review', 5)       // Returns 5 (5 × 1)
 */
export function calculatePointsForLog(
    type: 'memorization' | 'review' | 'activity',
    pagesCount: number = 1
): number {
    const multiplier = POINTS_PER_PAGE[type] || 1;
    return Math.max(0, Math.floor(pagesCount) * multiplier);
}

interface PointsState {
    points: number;
    totalPoints: number;
    inventory: Record<string, boolean>;
    loading: boolean;
    error: string | null;
}

export function usePointsSystem(userId: string | undefined) {
    const [state, setState] = useState<PointsState>({
        points: 0,
        totalPoints: 0,
        inventory: {},
        loading: true,
        error: null
    });

    // 1. Real-time Listener (The Reader)
    useEffect(() => {
        if (!userId) {
            setState(prev => ({ ...prev, loading: false }));
            return;
        }

        const userRef = doc(db, "users", userId);

        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();

                // Crucial Data Repair: Handle NaN/String/Undefined
                let safePoints = Number(data.points);
                if (isNaN(safePoints)) safePoints = 0;

                let safeTotal = Number(data.totalPoints);
                if (isNaN(safeTotal)) safeTotal = 0;

                console.log(`🔥 Firebase Live Update for ${userId}: points=${safePoints}`);

                setState({
                    points: safePoints,
                    totalPoints: safeTotal,
                    inventory: data.inventory || {},
                    loading: false,
                    error: null
                });
            } else {
                setState(prev => ({ ...prev, loading: false }));
            }
        }, (err) => {
            console.error("Points System Error:", err);
            setState(prev => ({ ...prev, loading: false, error: "Failed to load points" }));
        });

        return () => unsubscribe();
    }, [userId]);

    // 2. Atomic Operations (The Writers)

    /**
     * atomicAddPoints
     * Safe batch update to increment points and log the reason.
     */
    const addPoints = async (amount: number, reason: string, type: 'memorization' | 'review' | 'activity' = 'activity') => {
        if (!userId) return false;

        // Fail-Safe: Never add 0 or negative via this specific function unless intended (usually we want positive rewards)
        const validAmount = amount > 0 ? amount : 0;
        if (validAmount === 0) {
            console.warn("Attempted to add 0 points. Skipping transaction.");
            return false;
        }

        try {
            const batch = writeBatch(db);
            const userRef = doc(db, "users", userId);

            // Increment Points
            batch.update(userRef, {
                points: increment(validAmount),
                totalPoints: increment(validAmount)
            });

            // Optional: Create a log entry if needed, or we rely on the caller to create the specific 'log' document.
            // If we just want a simple history record:
            // const logRef = doc(collection(db, "users", userId, "history"));
            // batch.set(logRef, { type, reason, amount: validAmount, createdAt: serverTimestamp() });

            await batch.commit();
            console.log(`✅ Added ${validAmount} points to ${userId}`);
            return true;
        } catch (error) {
            console.error("Failed to add points:", error);
            throw error;
        }
    };

    /**
     * atomicSpendPoints
     * Transactional update to deduct points and grant item.
     * Prevents race conditions and double spending.
     */
    const spendPoints = async (amount: number, itemId: string) => {
        if (!userId) throw new Error("No user ID");

        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, "users", userId);
                const sfDoc = await transaction.get(userRef);

                if (!sfDoc.exists()) throw "User does not exist";

                const data = sfDoc.data();
                const currentPoints = Number(data.points);
                const safeCurrentPoints = isNaN(currentPoints) ? 0 : currentPoints;

                // Check 1: Already Owned?
                if (data.inventory && data.inventory[itemId]) {
                    throw "ALREADY_OWNED";
                }

                // Check 2: Balance
                if (safeCurrentPoints < amount) {
                    throw "INSUFFICIENT_FUNDS";
                }

                // Deduct & Grant
                transaction.update(userRef, {
                    points: increment(-amount),
                    [`inventory.${itemId}`]: true
                });
            });
            return true;
        } catch (error) {
            console.error("Spend Points Transaction Failed:", error);
            throw error; // Re-throw for UI handling
        }
    };

    return {
        ...state,
        addPoints,
        spendPoints
    };
}
