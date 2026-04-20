"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Crown,
    Calendar,
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowRight,
    ArrowLeft,
    RefreshCw,
    Loader2,
    Building2,
    MessageSquare,
    Eye,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    clientUserSubscriptionsService,
    ClientUserSubscription,
} from "@/services/client/userSubscriptions";
import {
    adminMembershipPlansService,
    MembershipPlan,
} from "@/services/admin/membershipPlans";

export default function MySubscriptionPage() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<ClientUserSubscription[]>(
        []
    );
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [subs, allPlans] = await Promise.all([
                clientUserSubscriptionsService.getMySubscription(),
                adminMembershipPlansService.getAllPlans(),
            ]);
            setSubscriptions(subs);
            setPlans(allPlans);
        } catch (err: any) {
            if (err?.status === 401 || err?.response?.status === 401) {
                router.push("/auth/sign-in");
                return;
            }
            setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    const getPlanById = (planId: number) => plans.find((p) => p.id === planId);

    const handleCancelSubscription = async (subId: number) => {
        try {
            setCancelling(true);
            await clientUserSubscriptionsService.cancelSubscription(subId);
            await fetchData();
        } catch (err: any) {
            setError("ไม่สามารถยกเลิกแพ็กเกจได้ กรุณาลองใหม่");
        } finally {
            setCancelling(false);
        }
    };

    const activeSub = subscriptions
        .filter((s) => s.status === "active")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
    const pastSubs = subscriptions.filter((s) => s !== activeSub && s.status !== "active");

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const formatPrice = (price: string) =>
        Number(price).toLocaleString("th-TH");

    const getDaysRemaining = (endDate: string | null) => {
        if (!endDate) return null;
        const diff = new Date(endDate).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const statusConfig = {
        active: {
            label: "ใช้งานอยู่",
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/20",
            icon: CheckCircle2,
        },
        expired: {
            label: "หมดอายุ",
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/20",
            icon: XCircle,
        },
        cancelled: {
            label: "ยกเลิกแล้ว",
            color: "text-white/40",
            bg: "bg-white/5 border-white/10",
            icon: XCircle,
        },
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f]">
                <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-20 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Back Button */}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-all text-sm font-medium group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        กลับไปหน้าโปรไฟล์
                    </Link>
                </motion.div>

                {/* Header */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-semibold mb-6"
                    >
                        <Crown size={16} /> MY SUBSCRIPTION
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black tracking-tight mb-3"
                    >
                        แพ็กเกจของฉัน
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/50 text-lg"
                    >
                        ดูรายละเอียดและจัดการแพ็กเกจสมาชิกของคุณ
                    </motion.p>
                </div>

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between"
                    >
                        <span className="font-medium">{error}</span>
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-sm font-bold transition-all"
                        >
                            <RefreshCw size={14} /> ลองใหม่
                        </button>
                    </motion.div>
                )}

                {/* Active Subscription */}
                {activeSub ? (
                    <ActiveSubscriptionCard
                        subscription={activeSub}
                        plan={getPlanById(activeSub.planId)}
                        formatDate={formatDate}
                        formatPrice={formatPrice}
                        getDaysRemaining={getDaysRemaining}
                        statusConfig={statusConfig}
                        onCancel={handleCancelSubscription}
                        cancelling={cancelling}
                    />
                ) : (
                    <NoSubscriptionCard />
                )}

                {/* Past Subscriptions */}
                {pastSubs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-6 bg-white/20 rounded-full" />
                            <h2 className="text-xl font-bold text-white/60">
                                ประวัติแพ็กเกจ
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {pastSubs.map((sub) => {
                                const plan = getPlanById(sub.planId);
                                const status = statusConfig[sub.status];
                                const StatusIcon = status.icon;
                                return (
                                    <div
                                        key={sub.id}
                                        className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                                <Crown size={20} className="text-white/30" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white/80">
                                                    {plan?.name || `แพ็กเกจ #${sub.planId}`}
                                                </p>
                                                <p className="text-sm text-white/40">
                                                    {formatDate(sub.startDate)}
                                                    {sub.endDate && ` — ${formatDate(sub.endDate)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-white/40 capitalize">
                                                {sub.billingCycle === "monthly"
                                                    ? "รายเดือน"
                                                    : "รายปี"}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.color}`}
                                            >
                                                <StatusIcon size={12} />
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

/* ─── Active Subscription Card ──────────────────────────────── */

function ActiveSubscriptionCard({
    subscription,
    plan,
    formatDate,
    formatPrice,
    getDaysRemaining,
    statusConfig,
    onCancel,
    cancelling,
}: {
    subscription: ClientUserSubscription;
    plan: MembershipPlan | undefined;
    formatDate: (d: string) => string;
    formatPrice: (p: string) => string;
    getDaysRemaining: (d: string | null) => number | null;
    statusConfig: Record<string, any>;
    onCancel: (id: number) => void;
    cancelling: boolean;
}) {
    const [showConfirm, setShowConfirm] = useState(false);
    const daysLeft = getDaysRemaining(subscription.endDate);
    const status = statusConfig[subscription.status];
    const StatusIcon = status.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-[#111118] to-[#0a0a0f] border border-amber-500/20 shadow-2xl shadow-amber-500/5"
        >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative p-8 md:p-10 space-y-8">
                {/* Top row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Crown size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">
                                {plan?.name || `แพ็กเกจ #${subscription.planId}`}
                            </h2>
                            <p className="text-white/50 text-sm">
                                {subscription.billingCycle === "monthly"
                                    ? "รายเดือน"
                                    : "รายปี"}
                            </p>
                        </div>
                    </div>
                    <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${status.bg} ${status.color}`}
                    >
                        <StatusIcon size={14} />
                        {status.label}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={Calendar}
                        label="เริ่มต้น"
                        value={formatDate(subscription.startDate)}
                    />
                    <StatCard
                        icon={Clock}
                        label="สิ้นสุด"
                        value={
                            subscription.endDate
                                ? formatDate(subscription.endDate)
                                : "ไม่จำกัด"
                        }
                    />
                    <StatCard
                        icon={CreditCard}
                        label="ราคา"
                        value={
                            plan
                                ? `฿${formatPrice(subscription.billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly)}`
                                : "—"
                        }
                    />
                    <StatCard
                        icon={RefreshCw}
                        label="ต่ออายุอัตโนมัติ"
                        value={subscription.autoRenew ? "เปิด" : "ปิด"}
                        valueColor={subscription.autoRenew ? "text-green-400" : "text-white/40"}
                    />
                </div>

                {/* Days remaining progress */}
                {daysLeft !== null && subscription.endDate && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/50">ระยะเวลาคงเหลือ</span>
                            <span
                                className={`font-bold ${daysLeft <= 7 ? "text-red-400" : daysLeft <= 30 ? "text-amber-400" : "text-green-400"}`}
                            >
                                {daysLeft} วัน
                            </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Math.min(100, (daysLeft / (subscription.billingCycle === "monthly" ? 30 : 365)) * 100)}%`,
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${daysLeft <= 7 ? "bg-red-500" : daysLeft <= 30 ? "bg-amber-500" : "bg-green-500"}`}
                            />
                        </div>
                    </div>
                )}

                {/* Plan Features */}
                {plan && (
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">
                            สิทธิ์ที่ได้รับ
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FeatureItem
                                icon={Building2}
                                label="ลงประกาศได้"
                                value={`${plan.maxListings} รายการ`}
                                active
                            />
                            <FeatureItem
                                icon={MessageSquare}
                                label="แชทกับลูกค้า"
                                value="เปิดใช้งาน"
                                active
                            />
                            <FeatureItem
                                icon={Eye}
                                label="ดูข้อมูลเจ้าของ"
                                value={
                                    plan.canViewOwnerContact
                                        ? "เปิดใช้งาน"
                                        : "ไม่สามารถใช้ได้"
                                }
                                active={plan.canViewOwnerContact}
                            />
                        </div>
                    </div>
                )}

                {/* Cancel Button */}
                <div className="pt-4 border-t border-white/5">
                    <AnimatePresence mode="wait">
                        {!showConfirm ? (
                            <motion.button
                                key="cancel-btn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowConfirm(true)}
                                className="flex items-center gap-2 text-sm text-white/30 hover:text-red-400 transition-all font-medium"
                            >
                                <XCircle size={16} /> ยกเลิกแพ็กเกจ
                            </motion.button>
                        ) : (
                            <motion.div
                                key="confirm-box"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-3"
                            >
                                <p className="text-sm text-red-400 font-medium">
                                    คุณแน่ใจหรือไม่ที่จะยกเลิกแพ็กเกจ? สิทธิ์ทั้งหมดจะถูกยกเลิกทันที
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            onCancel(subscription.id);
                                            setShowConfirm(false);
                                        }}
                                        disabled={cancelling}
                                        className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {cancelling ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <XCircle size={14} />
                                        )}
                                        ยืนยันยกเลิก
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all"
                                    >
                                        ไม่ใช่ ฉันเปลี่ยนใจ
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── No Subscription Card ──────────────────────────────────── */

function NoSubscriptionCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-3xl border-2 border-dashed border-white/10 p-12 md:p-16 text-center"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.03),transparent)] pointer-events-none" />
            <div className="relative space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                    <Sparkles size={36} className="text-white/20" />
                </div>
                <div>
                    <h3 className="text-2xl font-black mb-2">
                        ยังไม่มีแพ็กเกจที่ใช้งานอยู่
                    </h3>
                    <p className="text-white/40 max-w-md mx-auto">
                        สมัครแพ็กเกจสมาชิกเพื่อปลดล็อกฟีเจอร์พิเศษ ลงประกาศได้มากขึ้น
                        และเชื่อมต่อกับผู้ซื้อได้มากขึ้น
                    </p>
                </div>
                <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-[#0a0a0f] font-black rounded-2xl hover:shadow-lg hover:shadow-amber-500/25 transition-all active:scale-[0.98] text-sm"
                >
                    <Crown size={18} /> ดูแพ็กเกจทั้งหมด <ArrowRight size={18} />
                </Link>
            </div>
        </motion.div>
    );
}

/* ─── Stat Card ──────────────────────────────────────────────── */

function StatCard({
    icon: Icon,
    label,
    value,
    valueColor = "text-white",
}: {
    icon: any;
    label: string;
    value: string;
    valueColor?: string;
}) {
    return (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-amber-500/60" />
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                    {label}
                </span>
            </div>
            <p className={`text-sm font-bold ${valueColor}`}>{value}</p>
        </div>
    );
}

/* ─── Feature Item ───────────────────────────────────────────── */

function FeatureItem({
    icon: Icon,
    label,
    value,
    active,
}: {
    icon: any;
    label: string;
    value: string;
    active: boolean;
}) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
            <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${active ? "bg-amber-500/15 text-amber-500" : "bg-white/5 text-white/20"}`}
            >
                <Icon size={16} />
            </div>
            <div>
                <p className="text-xs text-white/40">{label}</p>
                <p
                    className={`text-sm font-bold ${active ? "text-white" : "text-white/30"}`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}
