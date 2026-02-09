"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc, deleteDoc, writeBatch, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Circle } from "@/lib/hooks/useSheikh";
import InstructorsManager from "@/components/sheikh/InstructorsManager";
import { Loader2, ArrowRight, Save, Trash2, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function CircleSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const circleId = params.id as string;

    const [circle, setCircle] = useState<Circle | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Edit Name State
    const [newName, setNewName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

    useEffect(() => {
        if (!circleId) return;

        const unsub = onSnapshot(doc(db, "circles", circleId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCircle({
                    id: docSnap.id,
                    name: data.name,
                    description: data.description,
                    sheikhIds: data.sheikhIds || [data.teacherId],
                    createdBy: data.createdBy,
                    inviteCode: data.inviteCode,
                    teacherId: data.teacherId,
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate(),
                } as Circle);

                // Initialize name if not editing
                if (!isRenaming) {
                    setNewName(data.name);
                }
            } else {
                setCircle(null);
            }
            setIsLoading(false);
        });

        return () => unsub();
    }, [circleId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRename = async () => {
        if (!newName.trim() || !circle) return;
        setIsRenaming(true);
        try {
            await updateDoc(doc(db, "circles", circle.id), {
                name: newName.trim(),
            });
            showToast("تم تحديث اسم الحلقة بنجاح", "success");
        } catch (error) {
            console.error("Rename error:", error);
            showToast("فشل في تحديث الاسم", "error");
        } finally {
            setIsRenaming(false);
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmation !== "DELETE" && deleteConfirmation !== "حذف") return;
        if (!circle) return;

        setIsDeleting(true);
        try {
            const batch = writeBatch(db);

            // 1. Unlink Students
            // Find all users in this circle
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("circleId", "==", circle.id));
            const snapshot = await getDocs(q);

            snapshot.docs.forEach((userDoc) => {
                batch.update(userDoc.ref, { circleId: null });
            });

            // 2. Delete Circle Members Subcollection (Optional but good for cleanup, skipping for now as it maps to users usually) 
            // Actually circleMembers is a separate root collection or subcollection? 
            // Based on previous tasks, there is a `circleMembers` collection. Ideally we delete those docs too.
            // Let's do it for completeness if possible, or just leave it. 
            // Prompt said: "Unlink Students: Update their documents". So I stick to that.

            // 3. Delete Circle Document
            const circleRef = doc(db, "circles", circle.id);
            batch.delete(circleRef);

            await batch.commit();

            showToast("تم حذف الحلقة بنجاح", "success");
            router.push("/sheikh/dashboard");
        } catch (error) {
            console.error("Delete circle error:", error);
            showToast("فشل في حذف الحلقة", "error");
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-emerald" />
            </div>
        );
    }

    if (!circle) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">الحلقة غير موجودة</h1>
                <Link href="/sheikh/circles" className="text-emerald hover:underline mt-4 block">
                    العودة للحلقات
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-surface-dark rounded-full transition-colors"
                >
                    <ArrowRight className="w-5 h-5 text-emerald-deep" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-emerald-deep">إعدادات الحلقة</h1>
                    <p className="text-text-muted">{circle.name}</p>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">

                {/* General Settings: Rename */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
                    <h2 className="font-bold text-lg mb-4 text-emerald-deep flex items-center gap-2">
                        <Info size={20} className="text-gold" />
                        بيانات الحلقة
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">اسم الحلقة</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20"
                                    placeholder="أدخل اسم الحلقة"
                                />
                                <Button
                                    onClick={handleRename}
                                    disabled={isRenaming || newName === circle.name || !newName.trim()}
                                    isLoading={isRenaming}
                                >
                                    <Save size={18} />
                                    حفظ
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">رمز الدعوة</label>
                            <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 font-mono text-center tracking-widest text-lg select-all">
                                {circle.inviteCode}
                            </div>
                            <p className="text-xs text-text-muted mt-1 text-center">شارك هذا الرمز مع الطلاب للانضمام</p>
                        </div>
                    </div>
                </div>

                {/* Instructors Manager */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
                    <InstructorsManager
                        circleId={circle.id}
                        existingSheikhIds={circle.sheikhIds}
                    />
                </div>

                {/* Danger Zone: Delete Circle */}
                <div className="mt-10 border border-red-200 bg-red-50 rounded-xl p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                منطقة الخطر
                            </h3>
                            <p className="text-sm text-red-600/80 mt-1">
                                حذف الحلقة سيقوم بإلغاء ارتباط جميع الطلاب بها ونقلهم إلى حالة &quot;غير مسجل&quot;. هذا الإجراء لا يمكن التراجع عنه.
                            </p>
                        </div>
                        <Button
                            variant="danger"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="shrink-0"
                        >
                            <Trash2 size={18} />
                            حذف الحلقة
                        </Button>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="حذف الحلقة نهائياً"
                >
                    <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg flex gap-3 text-red-800 text-sm">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <p>
                                تحذير: أنت على وشك حذف حلقة <strong>&quot;{circle.name}&quot;</strong>. سيتم إخراج جميع الطلاب منها. هذا الإجراء نهائي.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-2">
                                للتأكيد، يرجى كتابة كلمة <span className="font-bold select-all">حذف</span> أو <span className="font-bold select-all">DELETE</span> أدناه:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                placeholder="اكتب كلمة التأكيد هنا..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1"
                                disabled={isDeleting}
                            >
                                إلغاء
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDelete}
                                className="flex-1"
                                isLoading={isDeleting}
                                disabled={isDeleting || (deleteConfirmation !== "DELETE" && deleteConfirmation !== "حذف")}
                            >
                                تأكيد الحذف
                            </Button>
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
}
