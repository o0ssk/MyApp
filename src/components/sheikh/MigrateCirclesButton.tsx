"use client";

import { useState } from "react";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/hooks";
import { Button } from "@/components/ui/Button";
import { Loader2, Database } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function MigrateCirclesButton() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<string | null>(null);

    const handleMigrate = async () => {
        if (!user) return;
        if (!confirm("هل أنت متأكد من بدء ترحيل البيانات؟ (سيتم تحديث هيكل الحلقات القديمة)")) return;

        setIsLoading(true);
        setStats(null);

        try {
            const batch = writeBatch(db);
            let count = 0;

            // Query circles using the OLD field
            const circlesRef = collection(db, "circles");
            // Note: We use sheikhId (singular) here because that's what the old data has
            const q = query(circlesRef, where("sheikhId", "==", user.uid));
            const snapshot = await getDocs(q);

            snapshot.docs.forEach((d) => {
                const data = d.data();
                // Only update if sheikhIds is missing or empty
                if (!data.sheikhIds || !Array.isArray(data.sheikhIds)) {
                    batch.update(doc(db, "circles", d.id), {
                        sheikhIds: [data.sheikhId || user.uid], // Migrate old ID to new Array
                        // We also ensure teacherId is set for backward compat if missing
                        teacherId: data.teacherId || data.sheikhId || user.uid
                    });
                    count++;
                }
            });

            if (count > 0) {
                await batch.commit();
                showToast(`تم تحديث ${count} حلقة بنجاح`, "success");
                setStats(`تم تحديث ${count} حلقة`);
            } else {
                showToast("لا توجد حلقات تحتاج لتحديث", "info");
                setStats("جميع الحلقات محدثة بالفعل");
            }

        } catch (err: any) {
            console.error("Migration error:", err);
            showToast("فشل في ترحيل البيانات", "error");
            setStats("حدث خطأ: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-6">
            <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                أداة إصلاح البيانات
            </h3>
            <p className="text-sm text-orange-700 mb-4">
                اذا كانت حلقاتك القديمة لا تظهر، اضغط هنا لتحديث هيكل البيانات.
            </p>
            <div className="flex items-center gap-4">
                <Button
                    onClick={handleMigrate}
                    disabled={isLoading}
                    variant="primary"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "إصلاح / ترحيل الحلقات"}
                </Button>
                {stats && <span className="text-sm font-bold text-emerald-600">{stats}</span>}
            </div>
        </div>
    );
}
