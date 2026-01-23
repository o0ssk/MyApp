"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-4 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-emerald-deep mb-2">
                عذراً، حدث خطأ ما
            </h2>
            <p className="text-text-muted mb-8 max-w-md">
                واجهنا مشكلة غير متوقعة. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="gold">
                    <RotateCw size={18} className="ml-2" />
                    حاول مرة أخرى
                </Button>
                <Button onClick={() => window.location.reload()} variant="secondary">
                    تحديث الصفحة
                </Button>
            </div>
        </div>
    );
}
