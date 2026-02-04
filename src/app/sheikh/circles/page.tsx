"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Copy,
    Check,
    Users,
    Clock,
    BookOpen,
    X,
    UserCheck,
    UserX,
    Loader2,
    Trash2,
    Settings,
} from "lucide-react";
import Link from "next/link";

import { useSheikhCircles, useCircleMembers, Circle } from "@/lib/hooks/useSheikh";
import { useToast } from "@/components/ui/Toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { staggerContainer, fadeUp, listItem } from "@/lib/motion";

export default function CirclesPage() {
    const { circles, isLoading, error, createCircle } = useSheikhCircles();
    const { showToast } = useToast();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

    const handleCreateCircle = async (data: { name: string; description: string }) => {
        const result = await createCircle(data);
        if (result.success) {
            showToast("تم إنشاء الحلقة بنجاح", "success");
            setIsCreateModalOpen(false);
        } else {
            showToast(result.error || "فشل في إنشاء الحلقة", "error");
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-between mb-6"
            >
                <div>
                    <h1 className="text-2xl font-bold text-emerald-deep">الحلقات</h1>
                    <p className="text-text-muted">إدارة حلقاتك القرآنية</p>
                </div>
                <Button variant="gold" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={18} />
                    إنشاء حلقة
                </Button>
            </motion.div>

            {/* Loading */}
            {isLoading && (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="h-24" />
                        </Card>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && !isLoading && (
                <Card>
                    <EmptyState
                        icon={<Users size={40} />}
                        title="خطأ في التحميل"
                        description={error}
                    />
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && circles.length === 0 && (
                <Card>
                    <EmptyState
                        icon={<BookOpen size={40} />}
                        title="لا توجد حلقات بعد"
                        description="أنشئ حلقتك الأولى لبدء استقبال الطلاب"
                        action={{
                            label: "إنشاء حلقة",
                            onClick: () => setIsCreateModalOpen(true),
                        }}
                    />
                </Card>
            )}

            {/* Circles Grid */}
            {!isLoading && !error && circles.length > 0 && (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4"
                >
                    {circles.map((circle) => (
                        <motion.div key={circle.id} variants={listItem}>
                            <CircleCard
                                circle={circle}
                                onClick={() => setSelectedCircle(circle)}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Create Modal */}
            <CreateCircleModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateCircle}
            />

            {/* Circle Details Drawer */}
            <AnimatePresence>
                {selectedCircle && (
                    <CircleDetailsDrawer
                        circle={selectedCircle}
                        onClose={() => setSelectedCircle(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Circle Card Component
function CircleCard({ circle, onClick }: { circle: Circle; onClick: () => void }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(circle.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald/10 flex items-center justify-center">
                        <BookOpen size={24} className="text-emerald" />
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-deep">{circle.name}</h3>
                        {circle.description && (
                            <p className="text-sm text-text-muted line-clamp-1">
                                {circle.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Invite Code */}
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-2 bg-sand rounded-lg text-sm font-mono hover:bg-gold/10 transition-colors"
                    >
                        {copied ? (
                            <Check size={16} className="text-emerald" />
                        ) : (
                            <Copy size={16} className="text-text-muted" />
                        )}
                        <span dir="ltr">{circle.inviteCode}</span>
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

// Create Circle Modal
function CreateCircleModal({
    isOpen,
    onClose,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string }) => Promise<void>;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        await onSubmit({ name: name.trim(), description: description.trim() });
        setIsLoading(false);
        setName("");
        setDescription("");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إنشاء حلقة جديدة">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                        اسم الحلقة *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: حلقة الفجر"
                        className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-emerald-deep mb-2">
                        الوصف (اختياري)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="وصف مختصر للحلقة..."
                        rows={3}
                        className="w-full px-4 py-3 bg-sand border border-border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        إلغاء
                    </Button>
                    <Button
                        type="submit"
                        variant="gold"
                        isLoading={isLoading}
                        className="flex-1"
                    >
                        إنشاء الحلقة
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

// Circle Details Drawer
function CircleDetailsDrawer({
    circle,
    onClose,
}: {
    circle: Circle;
    onClose: () => void;
}) {
    const { pendingMembers, approvedMembers, isLoading, approveMember, rejectMember, removeMember } =
        useCircleMembers(circle.id);
    const { showToast } = useToast();
    const [copied, setCopied] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(circle.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleApprove = async (memberId: string) => {
        setProcessingId(memberId);
        const result = await approveMember(memberId);
        setProcessingId(null);
        if (result.success) {
            showToast("تم قبول الطالب بنجاح", "success");
        } else {
            showToast(result.error || "فشل في قبول الطالب", "error");
        }
    };

    const handleReject = async (memberId: string) => {
        setProcessingId(memberId);
        const result = await rejectMember(memberId);
        setProcessingId(null);
        if (result.success) {
            showToast("تم رفض الطلب", "success");
        } else {
            showToast(result.error || "فشل في رفض الطلب", "error");
        }
    };

    const handleRemove = async (memberId: string, userId: string) => {
        if (!confirm("هل أنت متأكد من إزالة الطالب من هذه الحلقة؟")) return;

        setProcessingId(memberId);
        const result = await removeMember(memberId, userId);
        setProcessingId(null);

        if (result.success) {
            showToast("تم إزالة الطالب بنجاح", "success");
        } else {
            showToast(result.error || "فشل في إزالة الطالب", "error");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
        >
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="absolute left-0 top-0 h-full w-full max-w-md bg-surface overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-surface border-b border-border p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-emerald-deep">{circle.name}</h2>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/sheikh/circles/${circle.id}/settings`}
                            className="p-2 rounded-lg hover:bg-sand transition-colors text-text-muted hover:text-emerald"
                            title="الإعدادات"
                        >
                            <Settings size={20} />
                        </Link>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-sand transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {/* Invite Code */}
                    <Card>
                        <CardContent>
                            <p className="text-sm text-text-muted mb-2">رمز الدعوة</p>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-mono font-bold text-emerald-deep">
                                    {circle.inviteCode}
                                </span>
                                <Button variant="secondary" size="sm" onClick={handleCopy}>
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? "تم النسخ" : "نسخ"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Members */}
                    <div>
                        <h3 className="font-bold text-emerald-deep mb-3 flex items-center gap-2">
                            <Clock size={18} className="text-gold" />
                            طلبات الانضمام ({pendingMembers.length})
                        </h3>
                        {isLoading ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-16 bg-sand rounded-xl" />
                            </div>
                        ) : pendingMembers.length === 0 ? (
                            <p className="text-text-muted text-sm">لا توجد طلبات معلقة</p>
                        ) : (
                            <div className="space-y-2">
                                {pendingMembers.map((member) => (
                                    <Card key={member.id}>
                                        <CardContent className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center">
                                                    <Users size={18} className="text-text-muted" />
                                                </div>
                                                <span className="font-medium">{member.userName}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(member.id)}
                                                    disabled={processingId === member.id}
                                                    className="p-2 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald/20 transition-colors disabled:opacity-50"
                                                >
                                                    {processingId === member.id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <UserCheck size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(member.id)}
                                                    disabled={processingId === member.id}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    <UserX size={18} />
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Approved Members */}
                    <div>
                        <h3 className="font-bold text-emerald-deep mb-3 flex items-center gap-2">
                            <Users size={18} className="text-emerald" />
                            الأعضاء ({approvedMembers.length})
                        </h3>
                        {isLoading ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-16 bg-sand rounded-xl" />
                            </div>
                        ) : approvedMembers.length === 0 ? (
                            <p className="text-text-muted text-sm">لا يوجد أعضاء حتى الآن</p>
                        ) : (
                            <div className="space-y-2">
                                {approvedMembers.map((member) => (
                                    <Card key={member.id}>
                                        <CardContent className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                                                    <Users size={18} className="text-emerald" />
                                                </div>
                                                <div>
                                                    <span className="font-medium">{member.userName}</span>
                                                    <p className="text-xs text-text-muted">
                                                        انضم{" "}
                                                        {member.approvedAt?.toLocaleDateString("ar-SA") || ""}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleRemove(member.id, member.userId)}
                                                disabled={processingId === member.id}
                                                className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                title="إزالة من الحلقة"
                                            >
                                                {processingId === member.id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
