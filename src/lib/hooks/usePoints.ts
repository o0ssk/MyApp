import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import {
    doc,
    onSnapshot,
    writeBatch,
    runTransaction,
    increment,
    updateDoc
} from "firebase/firestore";

interface PointsState {
    points: number;
    totalPoints: number;
    inventory: Record<string, boolean>;
    equipped: {
        badge?: string;
        frame?: string;
        avatar?: string;
    };
    loading: boolean;
    error: string | null;
}

export function usePoints(userId: string | undefined) {
    const [state, setState] = useState<PointsState>({
        points: 0,
        totalPoints: 0,
        inventory: {},
        equipped: {},
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

                // Auto-Repair: Force cast to Number
                let safePoints = Number(data.points);
                if (isNaN(safePoints)) safePoints = 0;

                let safeTotal = Number(data.totalPoints);
                if (isNaN(safeTotal)) safeTotal = 0;

                setState({
                    points: safePoints,
                    totalPoints: safeTotal,
                    inventory: data.inventory || {},
                    equipped: {
                        badge: data.equippedBadge,
                        frame: data.equippedFrame,
                        avatar: data.equippedAvatar
                    },
                    loading: false,
                    error: null
                });
            } else {
                setState(prev => ({ ...prev, loading: false }));
            }
        }, (err) => {
            console.error("Points Hook Error:", err);
            setState(prev => ({ ...prev, loading: false, error: "Failed to load points" }));
        });

        return () => unsubscribe();
    }, [userId]);

    // 2. Atomic Operations (The Writers)

    const addPoints = async (amount: number) => {
        if (!userId) return;
        const batch = writeBatch(db);
        const userRef = doc(db, "users", userId);
        batch.update(userRef, {
            points: increment(amount),
            totalPoints: increment(amount)
        });
        await batch.commit();
    };

    const spendPoints = async (amount: number, itemId: string) => {
        if (!userId) throw new Error("No user ID");

        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", userId);
            const sfDoc = await transaction.get(userRef);

            if (!sfDoc.exists()) throw "User not found";

            const data = sfDoc.data();
            const currentPoints = Number(data.points) || 0;

            if (data.inventory && data.inventory[itemId]) {
                throw "ALREADY_OWNED";
            }

            if (currentPoints < amount) {
                throw "INSUFFICIENT_FUNDS";
            }

            transaction.update(userRef, {
                points: increment(-amount),
                [`inventory.${itemId}`]: true
            });
        });
    };

    const equipItem = async (type: 'badge' | 'frame' | 'avatar', itemId: string) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        const fieldName = type === 'badge' ? 'equippedBadge' : type === 'frame' ? 'equippedFrame' : 'equippedAvatar';

        await updateDoc(userRef, {
            [fieldName]: itemId
        });
    };

    /**
     * hardResetPoints
     * CRITICAL DIAGNOSTIC FUNCTION
     * Forces the database to a clean number state, fixing any corruption.
     */
    const hardResetPoints = async (newValue: number) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            points: newValue,
            totalPoints: newValue // Reset total too for consistency in this diagnostic
        });
        console.log(`🚨 HARD RESET performed for ${userId}: Sets points to ${newValue}`);
    };

    return {
        ...state,
        addPoints,
        spendPoints,
        equipItem,
        hardResetPoints
    };
}
