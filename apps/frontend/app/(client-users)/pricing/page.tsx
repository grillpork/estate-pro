"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { adminMembershipPlansService, MembershipPlan } from "@/services/admin/membershipPlans";

const PricingPage = () => {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const allPlans = await adminMembershipPlansService.getAllPlans();
        // Show only active plans, with the popular plan (index 1) first
        const activePlans = allPlans.filter(p => p.isActive);
        if (activePlans.length > 1) {
          const [first, second, ...rest] = activePlans;
          setPlans([second, first, ...rest]);
        } else {
          setPlans(activePlans);
        }
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: MembershipPlan) => {
    // Wait for session to finish loading before checking auth
    if (isSessionLoading) return;

    const destination = `/checkout?planId=${plan.id}&cycle=${billingCycle}`;

    // If session exists, go to checkout. If session hook didn't pick up
    // the logged-in state yet (race), fallback to checking localStorage token.
    if (session || (typeof window !== "undefined" && localStorage.getItem("token"))) {
      router.push(destination);
      return;
    }

    // Not logged in: redirect to sign-in and preserve destination
    router.push(`/auth/sign-in?from=${encodeURIComponent(destination)}`);
  };

  const formatPrice = (priceStr: string) => {
    return Number(priceStr).toLocaleString("th-TH");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Header Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-semibold"
          >
            <Crown size={16} />
            ESTATEPRO MEMBERSHIP
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight"
          >
            Choose the perfect plan <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-600">
              for your real estate journey
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg"
          >
            Unlock premium features, list more properties, and connect with more buyers.
            Cancel anytime.
          </motion.p>
        </div>

        {/* Toggle Billing Cycle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <div className="bg-white/5 p-1 rounded-2xl inline-flex relative backdrop-blur-xl border border-white/10">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all ${billingCycle === "monthly" ? "text-white" : "text-white/50 hover:text-white"
                }`}
            >
              Pay Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all ${billingCycle === "yearly" ? "text-white" : "text-white/50 hover:text-white"
                }`}
            >
              Pay Yearly
              <span className="absolute -top-3 -right-3 bg-amber-500 text-[#0a0a0f] text-[10px] px-2 py-0.5 rounded-full shadow-lg">
                Save 20%
              </span>
            </button>

            {/* Sliding Highlight */}
            <div
              className={`absolute top-1 bottom-1 w-1/2 bg-white/10 rounded-xl border border-white/10 transition-all duration-300 ease-in-out ${billingCycle === "monthly" ? "left-1" : "translate-x-full left-[-4px]"
                }`}
            />
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
          {isLoading ? (
            // Skeleton Loaders
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-[500px] rounded-3xl bg-white/5 animate-pulse border border-white/5" />
            ))
          ) : (
            plans.map((plan, i) => {
              const isPopular = i === 0;
              const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
              const period = billingCycle === "monthly" ? "/mo" : "/yr";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`relative p-8 rounded-3xl backdrop-blur-xl flex flex-col h-full transform transition-all duration-300 hover:-translate-y-2 ${isPopular
                    ? "bg-linear-to-b from-amber-500/10 to-[#0a0a0f] border-2 border-amber-500/50 shadow-2xl shadow-amber-500/10"
                    : "bg-white/5 border border-white/10 hover:border-white/20"
                    }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-amber-400 to-amber-600 text-[#0a0a0f] text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-white/60 text-sm h-10 line-clamp-2">{plan.description}</p>
                  </div>

                  <div className="mb-8 flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter">฿{formatPrice(price)}</span>
                    <span className="text-white/50 font-medium">{period}</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-10 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className="text-sm">Up to <strong className="text-white">{plan.maxListings}</strong> property listings</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className="text-sm">
                        Direct messaging with clients
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${plan.canViewOwnerContact ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-white/30"}`}>
                        {plan.canViewOwnerContact ? <Check size={14} strokeWidth={3} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </div>
                      <span className={`text-sm ${plan.canViewOwnerContact ? "" : "text-white/40"}`}>
                        View restricted owner contacts
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isSessionLoading}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-wait ${isPopular
                      ? "bg-linear-to-r from-amber-400 to-amber-600 text-[#0a0a0f] hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]"
                      : "bg-white/10 text-white hover:bg-white/20 active:scale-[0.98]"
                      }`}
                  >
                    Select {plan.name}
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default PricingPage;
