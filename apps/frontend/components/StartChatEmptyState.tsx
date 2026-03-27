"use client";

import { MessageCircle, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function StartChatEmptyState() {
  const router = useRouter();

  const handleStartAdminChat = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/sign-in");
      return;
    }
    const user = JSON.parse(userStr);

    // Assume User ID 1 is Admin/System
    if (user.id === 1) {
        router.push("/conversations");
        return;
    }

    try {
      const res = await api.post("/conversations", {
        user1Id: user.id,
        user2Id: 1, // Admin ID
      });

      if (res.data) {
        router.push(`/conversations/${res.data.id}`);
      }
    } catch (error: any) {
        router.push("/conversations");
    }
  };

  return (
    <div className="col-span-full py-20 bg-[#111118] border border-white/5 rounded-[40px] text-center shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/10 mx-auto mb-6 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500">
          <Building2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">ไม่พบรายการอสังหาริมทรัพย์</h3>
        <p className="text-white/30 text-sm max-w-xs mx-auto mb-8">
          ขออภัยครับ ขณะนี้ยังไม่มีรายการประกาศในระบบ แต่คุณสามารถทักแชทสอบถามแอดมินหรือความต้องการเบื้องต้นได้เลยครับ
        </p>

        <button
          onClick={handleStartAdminChat}
          className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-95"
        >
          <MessageCircle className="w-5 h-5" />
          คุยกับแอดมินก่อนได้ที่นี่
        </button>
      </div>
    </div>
  );
}
