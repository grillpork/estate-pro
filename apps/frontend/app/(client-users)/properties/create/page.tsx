"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ListingProperty from "@/components/FormProperty";
import {
  clientUserSubscriptionsService,
  QuotaCheck,
} from "@/services/client/userSubscriptions";
import { ShieldAlert, Crown, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const CreatePropertyPage = () => {
  const router = useRouter();
  const [quota, setQuota] = useState<QuotaCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientUserSubscriptionsService
      .checkQuota()
      .then((data) => setQuota(data))
      .catch(() =>
        setQuota({
          hasSubscription: false,
          canCreateListing: false,
          code: "NO_SUBSCRIPTION",
          message: "ไม่สามารถตรวจสอบแพลนได้ กรุณาลองใหม่อีกครั้ง",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-white/50 text-sm">กำลังตรวจสอบแพลนของคุณ...</p>
        </div>
      </div>
    );
  }

  // Blocked — no subscription or exceeded limit
  if (quota && !quota.canCreateListing) {
    const isNoSub = quota.code === "NO_SUBSCRIPTION";
    const isExpired = quota.code === "SUBSCRIPTION_EXPIRED";

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
        <div className="max-w-md w-full bg-[#111118] border border-white/8 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            {isNoSub || isExpired ? (
              <ShieldAlert size={32} className="text-amber-400" />
            ) : (
              <Crown size={32} className="text-amber-400" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              {isNoSub
                ? "คุณยังไม่ได้สมัครแพลน"
                : isExpired
                  ? "แพลนของคุณหมดอายุแล้ว"
                  : "ลงประกาศครบจำนวนสูงสุดแล้ว"}
            </h2>
            <p className="text-white/50 text-sm">{quota.message}</p>
          </div>

          {quota.code === "MAX_LISTINGS_REACHED" && (
            <div className="bg-white/5 rounded-xl p-4 text-sm">
              <div className="flex justify-between text-white/60 mb-1">
                <span>แพลนปัจจุบัน</span>
                <span className="text-amber-400 font-semibold">
                  {quota.planName}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>ประกาศ</span>
                <span className="text-white font-semibold">
                  {quota.currentListings} / {quota.maxListings} รายการ
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {(isNoSub || isExpired) && (
              <Link
                href="/pricing"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all text-sm"
              >
                <Crown size={16} /> ดูแพลนทั้งหมด
              </Link>
            )}
            {quota.code === "MAX_LISTINGS_REACHED" && (
              <Link
                href="/pricing"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all text-sm"
              >
                <Crown size={16} /> อัปเกรดแพลน
              </Link>
            )}
            <button
              onClick={() => router.back()}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/10 text-white/60 hover:text-white hover:border-white/20 rounded-xl transition-all text-sm"
            >
              <ArrowLeft size={16} /> กลับ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Allowed — show form
  const handleAfterSubmit = async () => {
    try {
      // สร้างทรัพย์สินสำเร็จ
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <div>
      <ListingProperty onSubmit={handleAfterSubmit} />
    </div>
  );
};

export default CreatePropertyPage;
