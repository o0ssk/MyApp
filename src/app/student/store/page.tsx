"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingBag,
    Coins,
    Loader2,
    Check,
    Award,
    Layout,
    ShieldCheck,
    Backpack
} from "lucide-react";

import { useAuth } from "@/lib/auth/hooks";
import { usePoints } from "@/lib/hooks/usePoints";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { staggerContainer, listItem, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { StudentAvatar, FramePreview, FRAME_ASSETS } from "@/components/ui/StudentAvatar";
import { BADGE_ASSETS } from "@/components/ui/StudentBadge";

// ============================================================================
// STORE ITEMS - Tiered Economy System
// 🟢 Common (50-150) | 🔵 Rare (300-600) | 🟣 Legendary (1000-2500)
// ============================================================================

type RewardType = 'badge' | 'frame';
type RewardTier = 'common' | 'rare' | 'legendary';

interface Reward {
    id: string;
    type: RewardType;
    name: string;
    cost: number;
    image?: string;
    description?: string;
    tier: RewardTier;
}

const TIER_CONFIG = {
    common: { label: 'عادي', color: 'bg-emerald-100 text-emerald-700' },
    rare: { label: 'نادر', color: 'bg-blue-100 text-blue-700' },
    legendary: { label: 'أسطوري', color: 'bg-purple-100 text-purple-700' },
} as const;

const AVAILABLE_REWARDS: Reward[] = [
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🟣 LEGENDARY TIER (1000-2500 points) - Long-term goals
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    { id: "frame_super", type: "frame", name: "الإطار الخارق", cost: 2500, image: "/frames/my_super_image.png", tier: "legendary", description: "الإطار الأكثر تميزًا" },
    { id: "badge_coat_of_arms", type: "badge", name: "شعار النبالة", cost: 2000, image: "/badges/coat-of-arms.png", tier: "legendary", description: "شعار النبالة الملكي" },
    { id: "badge_trophy_star_4", type: "badge", name: "كأس النجوم الماسي", cost: 1800, image: "/badges/trophy-star (4).png", tier: "legendary", description: "كأس النجوم الماسي النادر" },
    { id: "badge_crown", type: "badge", name: "التاج الملكي", cost: 1500, image: "/badges/crown.png", tier: "legendary", description: "تاج الملوك الذهبي" },
    { id: "badge_1st_prize", type: "badge", name: "المركز الأول", cost: 1500, image: "/badges/1st-prize.png", tier: "legendary", description: "شارة الفوز بالمركز الأول" },
    { id: "frame_gold", type: "frame", name: "جائزة التميز الذهبية", cost: 1200, image: "/frames/award.png", tier: "legendary", description: "أعلى جائزة تميز" },
    { id: "badge_crown_1", type: "badge", name: "التاج الفضي", cost: 1200, image: "/badges/crown (1).png", tier: "legendary", description: "تاج الأمراء" },
    { id: "badge_diamond_1", type: "badge", name: "الماسة الملكية", cost: 1200, image: "/badges/diamond (1).png", tier: "legendary", description: "الماسة الملكية الفاخرة" },
    { id: "badge_diamond", type: "badge", name: "الماسة", cost: 1000, image: "/badges/diamond.png", tier: "legendary", description: "الماسة النادرة" },
    { id: "badge_trophy", type: "badge", name: "كأس البطولة", cost: 1000, image: "/badges/trophy.png", tier: "legendary", description: "كأس الفائزين الذهبي" },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔵 RARE TIER (300-600 points) - ~1 week of effort
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    { id: "frame_wreath_award", type: "frame", name: "إكليل النصر الملكي", cost: 600, image: "/frames/wreath-award.png", tier: "rare", description: "إكليل الأبطال" },
    { id: "frame_laurel", type: "frame", name: "غار المتفوقين", cost: 550, image: "/frames/laurel-wreath.png", tier: "rare", description: "إكليل الغار للمتفوقين" },
    { id: "badge_trophy_star", type: "badge", name: "كأس النجوم", cost: 500, image: "/badges/trophy-star.png", tier: "rare", description: "كأس النجوم المتألق" },
    { id: "badge_award", type: "badge", name: "جائزة التميز", cost: 500, image: "/badges/award.png", tier: "rare", description: "جائزة التقدير الخاصة" },
    { id: "frame_daisy", type: "frame", name: "زهرة الأقحوان", cost: 450, image: "/frames/daisy.png", tier: "rare", description: "إطار زهرة الأقحوان" },
    { id: "badge_trophy_star_1", type: "badge", name: "كأس النجوم الفضي", cost: 450, image: "/badges/trophy-star (1).png", tier: "rare", description: "كأس النجوم الفضي" },
    { id: "badge_film_award", type: "badge", name: "جائزة السينما", cost: 400, image: "/badges/film-award.png", tier: "rare", description: "جائزة الإبداع" },
    { id: "badge_trophy_star_2", type: "badge", name: "كأس النجوم البرونزي", cost: 400, image: "/badges/trophy-star (2).png", tier: "rare", description: "كأس النجوم البرونزي" },
    { id: "badge_gold_medal", type: "badge", name: "الميدالية الذهبية", cost: 400, image: "/badges/gold-medal.png", tier: "rare", description: "ميدالية الشرف الذهبية" },
    { id: "frame_flower_purple", type: "frame", name: "الزهرة البنفسجية", cost: 350, image: "/frames/flower_3.png", tier: "rare", description: "إطار الزهرة البنفسجية" },
    { id: "frame_flower", type: "frame", name: "زهرة الربيع", cost: 350, image: "/frames/flower.png", tier: "rare", description: "إطار زهرة الربيع" },
    { id: "badge_first_2", type: "badge", name: "الأول المميز", cost: 350, image: "/badges/first (2).png", tier: "rare", description: "شارة الأول الخاصة" },
    { id: "badge_high_quality", type: "badge", name: "الجودة العالية", cost: 350, image: "/badges/high-quality.png", tier: "rare", description: "ختم الجودة المميزة" },
    { id: "badge_first", type: "badge", name: "الأول", cost: 300, image: "/badges/first.png", tier: "rare", description: "شارة المركز الأول" },
    { id: "badge_success", type: "badge", name: "النجاح", cost: 300, image: "/badges/success.png", tier: "rare", description: "شارة النجاح والتفوق" },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🟢 COMMON TIER (50-150 points) - Accessible quickly
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    { id: "badge_rank_1", type: "badge", name: "الرتبة الذهبية", cost: 150, image: "/badges/rank (1).png", tier: "common", description: "شارة الرتبة العليا" },
    { id: "badge_reward_1", type: "badge", name: "المكافأة الذهبية", cost: 150, image: "/badges/reward (1).png", tier: "common", description: "شارة المكافأة الذهبية" },
    { id: "frame_classic", type: "frame", name: "الإطار الكلاسيكي", cost: 150, image: "/frames/frame.png", tier: "common", description: "إطار كلاسيكي أنيق" },
    { id: "frame_photo", type: "frame", name: "برواز الذكريات", cost: 150, image: "/frames/photo-frame.png", tier: "common", description: "برواز ذكريات جميل" },
    { id: "badge_heart", type: "badge", name: "القلب الذهبي", cost: 120, image: "/badges/heart.png", tier: "common", description: "قلب المحبة والإخلاص" },
    { id: "badge_generic_2", type: "badge", name: "شارة خاصة", cost: 120, image: "/badges/badge (2).png", tier: "common", description: "شارة خاصة ونادرة" },
    { id: "badge_club", type: "badge", name: "العصا", cost: 120, image: "/badges/club.png", tier: "common", description: "عصا القوة" },
    { id: "badge_power", type: "badge", name: "القوة", cost: 100, image: "/badges/power.png", tier: "common", description: "شارة القوة والتحدي" },
    { id: "badge_rank", type: "badge", name: "الرتبة", cost: 100, image: "/badges/rank.png", tier: "common", description: "شارة الرتبة العسكرية" },
    { id: "badge_reward", type: "badge", name: "المكافأة", cost: 100, image: "/badges/reward.png", tier: "common", description: "شارة المكافأة الخاصة" },
    { id: "badge_laurel", type: "badge", name: "إكليل الغار", cost: 100, image: "/badges/laurel.png", tier: "common", description: "إكليل النصر التقليدي" },
    { id: "badge_axe", type: "badge", name: "الفأس", cost: 100, image: "/badges/axe.png", tier: "common", description: "فأس المحارب" },
    { id: "badge_generic_1", type: "badge", name: "شارة مميزة", cost: 100, image: "/badges/badge (1).png", tier: "common", description: "شارة مميزة للطلاب" },
    { id: "frame_wreath", type: "frame", name: "إكليل البراعم", cost: 100, image: "/frames/wreath.png", tier: "common", description: "إكليل البراعم الجميل" },
    { id: "badge_wreath", type: "badge", name: "إكليل الزهور", cost: 80, image: "/badges/wreath.png", tier: "common", description: "إكليل الزهور الجميل" },
    { id: "badge_frame", type: "badge", name: "شارة الإطار", cost: 80, image: "/badges/frame.png", tier: "common", description: "شارة بتصميم الإطار" },
    { id: "badge_check_mark", type: "badge", name: "علامة الصح", cost: 80, image: "/badges/check-mark.png", tier: "common", description: "علامة الإنجاز" },
    { id: "badge_star", type: "badge", name: "نجمة التميز", cost: 50, image: "/badges/star.png", tier: "common", description: "نجمة التميز اللامعة" },
    { id: "badge_generic", type: "badge", name: "شارة كلاسيكية", cost: 50, image: "/badges/badge.png", tier: "common", description: "شارة كلاسيكية بسيطة" },
    { id: "frame_circle", type: "frame", name: "الدائرة البسيطة", cost: 50, image: "/frames/circle.png", tier: "common", description: "إطار دائري بسيط" },
    { id: "frame_round", type: "frame", name: "الإطار الدائري", cost: 50, image: "/frames/round.png", tier: "common", description: "إطار دائري أنيق" },
];

// Tabs
const TABS: { id: RewardType | 'all'; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'الكل', icon: ShoppingBag },
    { id: 'frame', label: 'إطارات', icon: Layout },
    { id: 'badge', label: 'شارات', icon: Award },
];

export default function StudentStorePage() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const {
        points,
        inventory,
        equipped,
        loading,
        spendPoints,
        equipItem
    } = usePoints(user?.uid);

    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [equippingId, setEquippingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<RewardType | 'all'>('all');

    // Purchase Logic
    const handleBuy = async (item: Reward) => {
        if (!user) return;

        if (points < item.cost) {
            showToast("رصيد النقاط غير كافي", "error");
            return;
        }
        if (inventory[item.id]) return;

        if (!confirm(`شراء "${item.name}" مقابل ${item.cost} نقطة؟`)) return;

        setBuyingId(item.id);

        try {
            await spendPoints(item.cost, item.id);
            showToast(`تم شراء "${item.name}" بنجاح!`, "success");
        } catch (error) {
            if (error === "INSUFFICIENT_FUNDS") {
                showToast("عذراً، رصيد النقاط غير كافي", "error");
            } else if (error === "ALREADY_OWNED") {
                showToast("أنت تملك هذا العنصر بالفعل", "error");
            } else {
                showToast("فشل عملية الشراء", "error");
            }
        } finally {
            setBuyingId(null);
        }
    };

    // Equip Logic
    const handleEquip = async (item: Reward) => {
        if (!user) return;
        setEquippingId(item.id);
        try {
            await equipItem(item.type, item.id);
            showToast(`تم تفعيل "${item.name}" بنجاح`, "success");
        } catch (error) {
            console.error("Equip failed:", error);
            showToast("فشل تفعيل العنصر", "error");
        } finally {
            setEquippingId(null);
        }
    };

    // Derived Data
    const filteredRewards = useMemo(() => {
        if (activeTab === 'all') return AVAILABLE_REWARDS;
        return AVAILABLE_REWARDS.filter(r => r.type === activeTab);
    }, [activeTab]);

    const myRewards = useMemo(() => {
        return AVAILABLE_REWARDS.filter(r => inventory[r.id]);
    }, [inventory]);

    const isEquipped = (item: Reward) => {
        return equipped?.[item.type] === item.id;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-emerald" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-border shadow-sm transition-all">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* CURRENT AVATAR PREVIEW */}
                        <StudentAvatar
                            student={user ? {
                                photoURL: user.photoURL,
                                equipped: equipped,
                                name: user.displayName || ""
                            } : null}
                            size="lg"
                        />
                        <div>
                            <h1 className="font-bold text-emerald-deep text-lg">المتجر الرقمي</h1>
                            <p className="text-xs text-text-muted">{AVAILABLE_REWARDS.length} عنصر متاح</p>
                        </div>
                    </div>

                    {/* Premium Balance Card */}
                    <div className="bg-gradient-to-r from-gold/20 to-gold/5 px-5 py-2 rounded-2xl flex items-center gap-3 border border-gold/30 shadow-sm">
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[10px] text-gold-dark font-semibold uppercase tracking-wider">الرصيد</span>
                            <span className="text-xl font-bold font-mono text-emerald-deep">{points.toLocaleString()}</span>
                        </div>
                        <div className="bg-gold p-1.5 rounded-full text-white shadow-sm">
                            <Coins size={18} className="fill-white" />
                        </div>
                    </div>
                </div>

                {/* Categories Tabs */}
                <div className="max-w-5xl mx-auto px-4 pb-0 overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 py-3 items-center">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const count = tab.id === 'all'
                                ? AVAILABLE_REWARDS.length
                                : AVAILABLE_REWARDS.filter(r => r.type === tab.id).length;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border",
                                        isActive
                                            ? "bg-emerald text-white border-emerald shadow-md shadow-emerald/20"
                                            : "bg-surface text-text-muted hover:bg-gray-50 border-transparent hover:border-border"
                                    )}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full",
                                        isActive ? "bg-white/20" : "bg-gray-100"
                                    )}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}

                        {/* Separator */}
                        <div className="h-6 w-px bg-border mx-1" />

                        {/* My Bag Button */}
                        <Link
                            href="#inventory"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap bg-gold/10 text-gold-dark border border-gold/30 hover:bg-gold/20 hover:border-gold/50 shadow-sm"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <Backpack size={16} />
                            حقيبتي
                            {myRewards.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/20 font-bold">
                                    {myRewards.length}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 py-6 space-y-10">

                {/* Store Grid */}
                <section>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        >
                            {filteredRewards.map((item) => {
                                const owned = !!inventory[item.id];
                                const canAfford = points >= item.cost;
                                const isBuying = buyingId === item.id;

                                const renderPreview = () => {
                                    if (item.type === 'frame') {
                                        // Use the FramePreview component for PNG frames
                                        return <FramePreview frameId={item.id} size="md" />;
                                    }
                                    // Badge preview - PNG image
                                    const badgeAsset = BADGE_ASSETS[item.id] || item.image;
                                    return (
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center",
                                            owned ? "bg-gold/10" : "bg-emerald/5"
                                        )}>
                                            {badgeAsset ? (
                                                <img
                                                    src={badgeAsset}
                                                    alt={item.name}
                                                    className="w-10 h-10 object-contain"
                                                />
                                            ) : (
                                                <Award size={32} className="text-gold" />
                                            )}
                                        </div>
                                    );
                                };

                                return (
                                    <motion.div variants={listItem} key={item.id}>
                                        <Card className={cn(
                                            "h-full border transition-all duration-300 relative overflow-hidden",
                                            owned
                                                ? "border-gold/30 bg-gold/5"
                                                : "hover:border-emerald/30 hover:shadow-lg hover:-translate-y-1"
                                        )}>
                                            {/* Item Type Badge */}
                                            <div className="absolute top-0 left-0 text-[8px] font-bold px-2 py-0.5 rounded-br-lg uppercase tracking-wider bg-slate-100 text-slate-600">
                                                {item.type === 'frame' ? 'إطار' : 'شارة'}
                                            </div>

                                            <CardContent className="p-3 flex flex-col items-center text-center h-full pt-6">
                                                {owned && (
                                                    <div className="absolute top-1 right-1 bg-gold text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                                                        <Check size={8} />
                                                        ملكي
                                                    </div>
                                                )}

                                                <div className="mb-3">
                                                    {renderPreview()}
                                                </div>

                                                <h3 className="font-bold text-emerald-deep text-xs mb-1 line-clamp-2 min-h-[2em]">
                                                    {item.name}
                                                </h3>

                                                <p className="text-[10px] text-text-muted mb-2 line-clamp-1">
                                                    {item.description}
                                                </p>

                                                <div className="mt-auto w-full space-y-2">
                                                    {!owned ? (
                                                        <>
                                                            <div className="flex items-center justify-center gap-1 font-mono text-sm font-bold text-emerald-deep">
                                                                {item.cost}
                                                                <Coins size={12} className="text-gold" />
                                                            </div>
                                                            <Button
                                                                variant={canAfford ? "primary" : "ghost"}
                                                                className="w-full text-xs h-8"
                                                                disabled={!canAfford || isBuying}
                                                                onClick={() => handleBuy(item)}
                                                                isLoading={isBuying}
                                                            >
                                                                {isBuying ? "..." : canAfford ? "شراء" : "نقاط غير كافية"}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="secondary"
                                                            className="w-full text-xs h-8 bg-gold/10 text-gold-dark hover:bg-gold/20"
                                                            onClick={() => handleEquip(item)}
                                                            disabled={equippingId !== null}
                                                        >
                                                            {isEquipped(item) ? "✓ مستخدم" : "تفعيل"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {filteredRewards.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mb-4">
                                <ShoppingBag size={40} className="text-emerald/50" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-deep mb-2">المتجر فارغ حالياً</h3>
                            <p className="text-text-muted text-sm max-w-xs">
                                انتظر التحديثات القادمة! ستتوفر إطارات وشارات جديدة قريباً 🎁
                            </p>
                        </div>
                    )}
                </section>

                {/* My Inventory Section */}
                {myRewards.length > 0 && (
                    <motion.section
                        id="inventory"
                        initial="hidden"
                        whileInView="visible"
                        variants={fadeUp}
                        className="border-t border-border pt-8 scroll-mt-40"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <Backpack className="text-emerald" size={24} />
                            <h2 className="text-xl font-bold text-emerald-deep">حقيبتي</h2>
                            <span className="text-xs bg-emerald/10 text-emerald px-2 py-1 rounded-full">{myRewards.length}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {myRewards.map((item) => {
                                const currentlyEquipped = isEquipped(item);
                                const isEquipping = equippingId === item.id;

                                const renderPreview = () => {
                                    if (item.type === 'frame') {
                                        return <FramePreview frameId={item.id} size="sm" />;
                                    }
                                    // Badge preview - PNG image
                                    const badgeAsset = BADGE_ASSETS[item.id] || item.image;
                                    return (
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gold/10">
                                            {badgeAsset ? (
                                                <img
                                                    src={badgeAsset}
                                                    alt={item.name}
                                                    className="w-8 h-8 object-contain"
                                                />
                                            ) : (
                                                <Award size={24} className="text-gold" />
                                            )}
                                        </div>
                                    );
                                };

                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "bg-white border p-3 rounded-xl flex items-center gap-3 transition-all hover:shadow-md",
                                            currentlyEquipped ? "border-emerald bg-emerald/5 ring-1 ring-emerald ring-offset-1" : "border-border"
                                        )}
                                    >
                                        {renderPreview()}

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-emerald-deep text-xs truncate">{item.name}</h4>
                                            <p className="text-[10px] text-text-muted mb-1">
                                                {item.type === 'badge' ? 'شارة' : 'إطار'}
                                            </p>

                                            {currentlyEquipped ? (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald bg-emerald/10 px-2 py-0.5 rounded w-fit">
                                                    <ShieldCheck size={10} />
                                                    مستخدم
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="w-full text-[10px] h-6"
                                                    disabled={isEquipping}
                                                    onClick={() => handleEquip(item)}
                                                >
                                                    {isEquipping ? "..." : "تفعيل"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.section>
                )}
            </main>
        </div>
    );
}
