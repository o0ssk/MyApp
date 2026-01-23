import { StatSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-4">
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-t-4 border-gold rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-t-4 border-emerald rounded-full animate-spin reverse-spin"></div>
            </div>
            <p className="text-emerald-deep font-medium animate-pulse">جاري التحميل...</p>
        </div>
    );
}
