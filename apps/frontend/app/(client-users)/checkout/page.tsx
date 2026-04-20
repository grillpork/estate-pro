"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CreditCard, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { adminMembershipPlansService, MembershipPlan } from "@/services/admin/membershipPlans";
import { clientUserSubscriptionsService } from "@/services/client/userSubscriptions";
import { toast } from "sonner";
import Link from "next/link";

const CheckoutPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const cycle = searchParams.get("cycle") as "monthly" | "yearly";

  const [plan, setPlan] = useState<MembershipPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [existingPlanName, setExistingPlanName] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!planId || !cycle) {
      router.push("/pricing");
      return;
    }

    const fetchData = async () => {
      try {
        const [planData, mySubs] = await Promise.all([
          adminMembershipPlansService.getPlanById(Number(planId)),
          clientUserSubscriptionsService.getMySubscription().catch(() => []),
        ]);
        setPlan(planData);

        const activeSub = mySubs.find((s) => s.status === "active");
        if (activeSub) {
          try {
            const activePlan = await adminMembershipPlansService.getPlanById(activeSub.planId);
            setExistingPlanName(activePlan.name);
          } catch {
            setExistingPlanName("แพลนปัจจุบัน");
          }
        }
      } catch (error) {
        console.error("Failed to load plan", error);
        toast.error("Failed to load plan details.");
        router.push("/pricing");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [planId, cycle, router]);

  const handlePayClick = () => {
    if (existingPlanName) {
      setShowConfirm(true);
    } else {
      handleMockPayment();
    }
  };

  const handleMockPayment = async () => {
    setShowConfirm(false);
    if (!plan) return;
    setIsProcessing(true);

    try {
      // Simulate Payment Gateway delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Successfully "paid", now create subscription in backend
      await clientUserSubscriptionsService.subscribeToPlan({
        planId: plan.id,
        billingCycle: cycle,
        autoRenew: true,
      });

      setIsSuccess(true);
      toast.success("Payment successful! Welcome to the premium tier.");

      // Redirect back to properties dashboard after brief delay
      setTimeout(() => {
        router.push("/my-properties");
      }, 2000);

    } catch (error: any) {
      console.error("Subscription failed", error);
      toast.error(error?.response?.data?.message || "Failed to process subscription.");
      setIsProcessing(false);
    }
  };

  const formatPrice = (priceStr: string) => Number(priceStr).toLocaleString("th-TH");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!plan) return null;

  const price = cycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
  const period = cycle === "monthly" ? "Month" : "Year";
  const tax = Number(price) * 0.07;
  const total = Number(price) + tax;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Plans
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Summary */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black mb-2">Checkout</h1>
              <p className="text-white/60">Review your order details below.</p>
            </div>

            {existingPlanName && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 mb-6">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-amber-400 font-bold text-sm">คุณมีแพลน "{existingPlanName}" อยู่แล้ว</p>
                  <p className="text-amber-400/60 text-xs mt-1">หากสมัครแพลนใหม่ แพลนเดิมจะถูกยกเลิกทันที</p>
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold">{plan.name} Plan</h3>
                  <p className="text-white/50 text-sm capitalize">Billed {cycle}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">฿{formatPrice(price)}</div>
                  <div className="text-white/50 text-xs">/{period.toLowerCase()}</div>
                </div>
              </div>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>฿{formatPrice(price)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>VAT (7%)</span>
                  <span>฿{formatPrice(tax.toString())}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-white/10">
                <div>
                  <span className="block text-white/50 text-xs mb-1">Total Due Today</span>
                  <span className="text-3xl font-black text-amber-500">฿{formatPrice(total.toString())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Payment Placeholder */}
          <div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col h-full min-h-[400px]">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-amber-500" /> Payment Details
              </h3>

              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] mb-8">
                <p className="text-white/40 text-sm mb-2 font-medium">Payment Gateway Integration Area</p>
                <p className="text-white/30 text-xs">Omise / Stripe / PromptPay will be rendered here.</p>
              </div>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 size={24} />
                    <span className="font-bold">Payment Successful!</span>
                  </motion.div>
                ) : (
                  <motion.button
                    key="pay-button"
                    onClick={handlePayClick}
                    disabled={isProcessing}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl font-bold text-[#0a0a0f] bg-linear-to-r from-amber-400 to-amber-600 hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Mock Payment: Pay ฿${formatPrice(total.toString())}`
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#18181b] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="text-amber-500" size={24} />
                </div>
                <h3 className="text-xl font-black text-white">ยืนยันการเปลี่ยนแพลน</h3>
              </div>
              <p className="text-white/60 text-sm mb-2">
                คุณกำลังใช้แพลน <span className="text-amber-400 font-bold">"{existingPlanName}"</span> อยู่
              </p>
              <p className="text-white/60 text-sm mb-6">
                หากสมัครแพลน <span className="text-white font-bold">"{plan?.name}"</span> แพลนเดิมจะถูกยกเลิกทันทีและไม่สามารถคืนเงินได้ ต้องการดำเนินการต่อหรือไม่?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 font-bold text-sm transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleMockPayment}
                  className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors"
                >
                  ยืนยัน สมัครแพลนใหม่
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutPage;
