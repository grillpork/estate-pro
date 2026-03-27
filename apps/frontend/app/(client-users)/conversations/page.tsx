"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import Link from "next/link";
import { MessageSquare, User, Calendar, ChevronRight } from "lucide-react";

export default function ConversationsListPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get("/conversations");
        setConversations(response.data);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white pt-24 pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black">ข้อความ</h1>
            <p className="text-white/40 text-sm">จัดการการสนทนาทั้งหมดของคุณ</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-[#111118] border border-white/5 rounded-[32px] p-20 text-center">
            <MessageSquare className="w-16 h-16 text-white/10 mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2">ยังไม่มีการสนทนา</h3>
            <p className="text-white/40 max-w-xs mx-auto">
              เมื่อคุณส่งข้อความหาเจ้าของทรัพย์ รายการสนทนาจะปรากฏที่นี่ครับ
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="group block bg-[#111118] border border-white/5 hover:border-amber-500/30 rounded-[24px] p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-amber-500 group-hover:text-black transition-all">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-amber-400 transition-colors">
                        คุยกับ: {conv.user2Id === 1 ? 'ระบบ / แอดมิน' : `User #${conv.user2Id}`}
                      </h3>
                      <div className="flex items-center gap-3 text-white/40 text-xs mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(conv.createdAt).toLocaleDateString('th-TH')}
                        </span>
                        {conv.propertyId && (
                           <span className="bg-white/5 px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wider">
                              เกี่ยวกับทรัพย์ #{conv.propertyId}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-amber-500 transition-all group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
