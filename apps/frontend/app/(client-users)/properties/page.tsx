"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PropertiesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // ส่งผู้ใช้ไปที่หน้า Filter หลักแบบ Dynamic
    router.replace("/properties/all");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] text-white">
      <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
        Loading Property Collection...
      </p>
    </div>
  );
}