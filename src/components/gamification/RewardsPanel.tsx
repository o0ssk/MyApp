"use client";

import { useState } from "react";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { StudentDetail } from "@/lib/hooks/useSheikhStudents";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Scroll, Umbrella, Gift, Ticket, Loader2 } from "lucide-react";

interface RewardsPanelProps {
    student: StudentDetail;
}

interface Reward {
    id: string;
    name: string;
    cost: number;
    icon: any;
    color: string;
    bg: string;
}

const REWARDS: Reward[] = [
    {
        id: "cert_500",
        name: "شهادة تقدير",
        cost: 500,
        icon: Scroll,
        color: "text-amber-600",
        bg: "bg-amber-100"
    },
    {
        id: "day_off_300",
        name: "إجازة يوم",
        cost: 300,
        icon: Umbrella,
        color: "text-blue-600",
        bg: "bg-blue-100"
    },
    {
        id: "gift_200",
        name: "هدية بسيطة",
        cost: 200,
        icon: Gift,
        color: "text-rose-600",
        bg: "bg-rose-100"
    },
    {
        id: "card_100",
        name: "بطاقة شكر",
        cost: 100,
        icon: Ticket,
        color: "text-purple-600",
        bg: "bg-purple-100"
    },
];

export function RewardsPanel({ student }: RewardsPanelProps) {
    const { showToast } = useToast();
    const [redeemingId, setRedeemingId] = useState<string | null>(null);

    // Redemption Logic
    const handleRedeem = async (reward: Reward) => {
        if (!student.points || student.points < reward.cost) {
            showToast("رصيد النقاط غير كافي", "error");
            return;
        }

        if (!confirm(`هل أنت متأكد من صرف ${reward.cost} نقطة مقابل "${reward.name}"؟`)) return;

        try {
            setRedeemingId(reward.id);
            const userRef = doc(db, "users", student.id);

            // 1. Deduct Points
            await updateDoc(userRef, {
                points: increment(-reward.cost)
            });

            // 2. Log Redemption (Optional but good for history)
            await addDoc(collection(db, "redemptions"), {
                studentId: student.id,
                studentName: student.name,
                rewardId: reward.id,
                rewardName: reward.name,
                cost: reward.cost,
                createdAt: serverTimestamp(),
            });

            showToast(`تم صرف المكافأة: ${reward.name} بنجاح!`, "success");
        } catch (err) {
            console.error("Redemption error:", err);
            showToast("حدث خطأ أثناء الصرف", "error");
        } finally {
            setRedeemingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Balance Header */}
            <div className="bg-emerald-deep text-white p-6 rounded-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/20 rounded-full translate-y-1/2 -translate-x-1/2" />

                <h3 className="text-lg font-medium opacity-90 mb-2">رصيد النقاط الحالي</h3>
                <p className="text-4xl font-bold font-mono">{student.points || 0}</p>
                <div className="mt-2 text-sm opacity-75">نقطة متاحة للصرف</div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {REWARDS.map((reward) => {
                    const canAfford = (student.points || 0) >= reward.cost;
                    const isRedeeming = redeemingId === reward.id;

                    return (
                        <div
                            key={reward.id}
                            className={`border rounded-xl p-4 flex flex-col gap-3 transition-colors ${canAfford ? 'bg-white border-border' : 'bg-gray-50 border-gray-100 opacity-70'}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-xl ${reward.bg}`}>
                                    <reward.icon size={24} className={reward.color} />
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-lg text-emerald-deep">{reward.cost}</span>
                                    <span className="text-xs text-text-muted block">نقطة</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-text-primary">{reward.name}</h4>
                            </div>

                            <Button
                                onClick={() => handleRedeem(reward)}
                                disabled={!canAfford || isRedeeming}
                                variant={canAfford ? "primary" : "ghost"}
                                className={`w-full mt-auto ${!canAfford && "cursor-not-allowed text-text-muted"}`}
                            >
                                {isRedeeming ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin ml-2" />
                                        جاري الصرف...
                                    </>
                                ) : canAfford ? (
                                    "صرف المكافأة"
                                ) : (
                                    "الرصيد لا يكفي"
                                )}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
