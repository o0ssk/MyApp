"use client";

import { useState } from "react";
import { useDeleteAccount } from "@/lib/hooks/useDeleteAccount";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

export function DeleteAccountZone() {
    const { deleteAccount, isDeleting, error } = useDeleteAccount();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");

    const handleDelete = async () => {
        if (confirmationText !== "DELETE" && confirmationText !== "حذف") return;
        await deleteAccount();
    };

    const isConfirmed = confirmationText === "DELETE" || confirmationText === "حذف";

    return (
        <div className="mt-10 border border-red-200 bg-red-50 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        منطقة الخطر
                    </h3>
                    <p className="text-sm text-red-600/80 mt-1">
                        حذف الحساب هو إجراء نهائي لا يمكن التراجع عنه. سيتم حذف جميع بياناتك من النظام.
                    </p>
                </div>
                <Button
                    variant="danger"
                    onClick={() => setIsModalOpen(true)}
                    className="shrink-0"
                >
                    حذف حسابي
                </Button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="حذف الحساب نهائياً"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg flex gap-3 text-red-800 text-sm">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>
                            تحذير: هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك وفقدان الوصول إلى حسابك بشكل دائم.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-2">
                            للتأكيد، يرجى كتابة كلمة <span className="font-bold select-all">حذف</span> أو <span className="font-bold select-all">DELETE</span> أدناه:
                        </label>
                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            placeholder="اكتب كلمة التأكيد هنا..."
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
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
                            disabled={!isConfirmed || isDeleting}
                        >
                            {isDeleting ? "جاري الحذف..." : "تأكيد الحذف النهائي"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
