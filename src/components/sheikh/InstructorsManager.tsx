"use client";

import { useState, useEffect } from "react";
import { useSheikhCircles } from "@/lib/hooks/useSheikh";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Button } from "@/components/ui/Button";
import { UserPlus, Trash2, Shield, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/hooks";

interface Instructor {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    circleId: string;
    existingSheikhIds: string[];
}

export default function InstructorsManager({ circleId, existingSheikhIds }: Props) {
    const { user: currentUser } = useAuth();
    const { addCoSheikh, removeCoSheikh } = useSheikhCircles();

    const [sheikhs, setSheikhs] = useState<Instructor[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);

    // Add logic
    const [emailInput, setEmailInput] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    // Promote logic
    const [addErrorIsRoleIssue, setAddErrorIsRoleIssue] = useState(false);
    const [roleErrorData, setRoleErrorData] = useState<{ id: string, name: string } | null>(null);

    // Remove logic
    const [processingId, setProcessingId] = useState<string | null>(null);

    // 1. Fetch details of current sheikhs
    useEffect(() => {
        async function fetchSheikhDetails() {
            setIsLoadingList(true);
            try {
                const details: Instructor[] = [];
                for (const sheikhId of existingSheikhIds) {
                    const userDoc = await getDoc(doc(db, "users", sheikhId));
                    if (userDoc.exists()) {
                        const d = userDoc.data();
                        details.push({
                            id: sheikhId,
                            name: d.name || "معلم",
                            email: d.email || "",
                            avatar: d.photoURL
                        });
                    }
                }
                setSheikhs(details);
            } catch (err) {
                console.error("Error fetching sheikhs:", err);
            } finally {
                setIsLoadingList(false);
            }
        }

        if (existingSheikhIds.length > 0) {
            fetchSheikhDetails();
        } else {
            setSheikhs([]);
            setIsLoadingList(false);
        }
    }, [existingSheikhIds]);

    // 2. Add Handler
    const handleAddSheikh = async () => {
        if (!emailInput.trim()) return;
        setAddError(null);
        setIsAdding(true);

        try {
            // A. Find user by email
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", emailInput.toLowerCase().trim()));
            const snap = await getDocs(q);

            if (snap.empty) {
                setAddError("لم يتم العثور على مستخدم بهذا البريد الإلكتروني");
                setIsAdding(false);
                return;
            }

            const userDoc = snap.docs[0];
            const userData = userDoc.data();
            console.log("Found User Data:", userData); // Debug log

            // B. Check Role
            const role = userData.role ? userData.role.toLowerCase().trim() : "";
            if (role !== "sheikh") {
                setAddErrorIsRoleIssue(true);
                setRoleErrorData({ id: userDoc.id, name: userData.name || "مستخدم" });
                // We don't set a generic error message string because the UI will show the special box
                setIsAdding(false);
                return;
            }

            // C. Check if already added
            if (existingSheikhIds.includes(userDoc.id)) {
                setAddError("هذا المعلم موجود بالفعل في الحلقة");
                setIsAdding(false);
                return;
            }

            // D. Add
            const result = await addCoSheikh(circleId, userDoc.id);
            if (result.success) {
                setEmailInput("");
                // Realtime update will trigger basic re-render of parent, 
                // but local list needs update or wait for parent props change.
                // Assuming parent listens to real-time doc, props will update automatically.
            } else {
                setAddError(result.error || "فشل في الإضافة");
            }

        } catch (err) {
            console.error("Add sheikh error:", err);
            setAddError("حدث خطأ غير متوقع");
        } finally {
            setIsAdding(false);
        }
    };

    // 3. Remove Handler
    const handleRemove = async (sheikhId: string) => {
        if (!confirm("هل أنت متأكد من إزالة هذا المعلم من الحلقة؟")) return;

        setProcessingId(sheikhId);
        await removeCoSheikh(circleId, sheikhId);
        setProcessingId(null);
    };

    // 4. Promote Handler
    const handlePromoteAndAdd = async () => {
        if (!addErrorIsRoleIssue || !roleErrorData) return;

        try {
            setIsAdding(true);
            setAddError(null);

            // 1. Promote User
            await updateDoc(doc(db, "users", roleErrorData.id), {
                role: "sheikh",
                updatedAt: serverTimestamp() // distinct from createdAt
            });

            // 2. Add as Co-Sheikh
            const result = await addCoSheikh(circleId, roleErrorData.id);

            if (result.success) {
                setEmailInput("");
                setRoleErrorData(null);
                setAddErrorIsRoleIssue(false);
            } else {
                setAddError(result.error || "فشل في الإضافة بعد الترقية");
            }
        } catch (err: any) {
            console.error("Promote error:", err);
            setAddError("فشل في ترقية المستخدم: " + err.message);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-emerald-deep border-b border-border pb-2">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold text-lg">إدارة المعلمين (المساعدين)</h3>
            </div>

            {/* List */}
            <div className="space-y-3">
                {isLoadingList ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald" />
                    </div>
                ) : (
                    sheikhs.map(sheikh => (
                        <div key={sheikh.id} className="flex items-center justify-between bg-surface-dark/50 p-3 rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center text-emerald font-bold overflow-hidden">
                                    {sheikh.avatar ? <img src={sheikh.avatar} alt={sheikh.name} /> : sheikh.name[0]}
                                </div>
                                <div>
                                    <p className="font-medium text-emerald-deep">{sheikh.name}</p>
                                    <p className="text-xs text-text-muted">{sheikh.email}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            {sheikh.id !== currentUser?.uid && (
                                <button
                                    onClick={() => handleRemove(sheikh.id)}
                                    disabled={!!processingId}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="إزالة المعلم"
                                >
                                    {processingId === sheikh.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                            {sheikh.id === currentUser?.uid && (
                                <span className="text-xs bg-emerald/10 text-emerald px-2 py-1 rounded-full">
                                    أنت
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add New */}
            <div className="bg-surface/50 p-4 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-emerald-deep">إضافة معلم جديد</h4>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <input
                            placeholder="أدخل البريد الإلكتروني للمعلم..."
                            value={emailInput}
                            onChange={(e) => {
                                setEmailInput(e.target.value);
                                setAddError(null);
                                setRoleErrorData(null);
                                setAddErrorIsRoleIssue(false);
                            }}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                        />
                    </div>
                    <Button
                        onClick={handleAddSheikh}
                        disabled={isAdding || !emailInput}
                        className="bg-emerald hover:bg-emerald-deep text-white"
                    >
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    </Button>
                </div>

                {/* Role Issue Alert & Action */}
                {addErrorIsRoleIssue && roleErrorData && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex flex-col gap-2">
                        <p className="text-sm text-amber-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            هذا المستخدم مسجل حالياً كـ &quot;طالب&quot;. هل تريد ترقيته ليكون &quot;معلم&quot; وإضافته؟
                        </p>
                        <Button
                            variant="gold"
                            size="sm"
                            onClick={handlePromoteAndAdd}
                            className="self-end"
                        >
                            ترقية وإضافة
                        </Button>
                    </div>
                )}

                {/* Generic Error */}
                {addError && !addErrorIsRoleIssue && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {addError}
                    </p>
                )}

                <p className="text-xs text-text-muted">
                    ملاحظة: يجب أن يكون المستخدم مسجلاً في النظام.
                </p>
            </div>
        </div>
    );
}
