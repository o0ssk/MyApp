import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mb-6 text-gold">
                <Search size={48} />
            </div>
            <h1 className="text-6xl font-bold text-emerald-deep mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-emerald-deep mb-4">
                الصفحة غير موجودة
            </h2>
            <p className="text-text-muted mb-8 max-w-md">
                عذراً، الصفحة التي تحاول الوصول إليها قد تكون حذفت أو تم تغيير رابطها.
            </p>
            <Link href="/">
                <Button variant="gold" size="lg">
                    <Home size={18} className="ml-2" />
                    العودة للرئيسية
                </Button>
            </Link>
        </div>
    );
}
