"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import Link from "next/link";
import { MessageSquare, User, Calendar, ChevronRight, Users, Star, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConversationsListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [creating, setCreating] = useState<number | null>(null);

  useEffect(() => {
    const initData = async () => {
      let user = null;
      const userStr = localStorage.getItem('user');
      
      if (userStr) {
        try {
          user = JSON.parse(userStr);
          setCurrentUser(user);
        } catch (e) {
          console.error("Local storage user parse error");
        }
      }

      // Fallback: หากใน localStorage ไม่มี หรือข้อมูลไม่ครบ ให้ลองดึงข้อมูลจาก /auth/me
      if (!user) {
        try {
          const meRes = await api.get("/auth/me");
          if (meRes.data) {
            user = meRes.data;
            setCurrentUser(user);
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (e) {
          console.warn("User is truly not logged in");
        }
      }

      try {
        const [convRes, userRes] = await Promise.all([
          api.get("/conversations"),
          api.get("/api/users")
        ]);
        setConversations(convRes.data || []);
        setAvailableUsers((userRes.data || []).filter((u: any) => u.id !== user?.id));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleStartChat = async (targetUser: any) => {
    if (!currentUser) {
        alert("กรุณาเข้าสู่ระบบก่อนเริ่มการสนทนาครับ");
        router.push("/auth/sign-in");
        return;
    }

    setCreating(targetUser.id);
    try {
      // 1. เช็คก่อนว่ามีห้องแชทกับคนนี้อยู่แล้วไหม (เพื่อความไว)
      const existing = conversations.find(c => 
        (c.user1Id === currentUser.id && c.user2Id === targetUser.id) ||
        (c.user1Id === targetUser.id && c.user2Id === currentUser.id)
      );

      if (existing) {
        router.push(`/conversations/${existing.id}`);
        return;
      }

      // 2. ถ้าไม่มี ค่อยสร้างใหม่
      const res = await api.post("/conversations", {
        user1Id: currentUser.id,
        user2Id: targetUser.id,
      });

      if (res.data && res.data.id) {
        router.push(`/conversations/${res.data.id}`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Start chat error:", error);
      alert("เกิดข้อผิดพลาดในการสร้างห้องแชท กรุณาลองใหม่อีกครั้งครับ");
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white pt-24 pb-12">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/5">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">ข้อความ</h1>
              <p className="text-white/40 text-sm font-medium">จัดการการสนทนาและเอเจนต์ของคุณ</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main List: Existing Conversations */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/80 mb-6 flex items-center gap-2">
               <span className="w-6 h-px bg-amber-500/20"></span>
               การสนทนาล่าสุด
            </h2>

            {loading ? (
              <div className="flex justify-center p-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="bg-[#111118] border border-white/5 rounded-[40px] p-20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <MessageSquare className="w-16 h-16 text-white/5 mx-auto mb-6 transition-transform group-hover:scale-110 duration-500" />
                <h3 className="text-xl font-bold mb-2">ยังไม่มีประวัติการคุย</h3>
                <p className="text-white/30 max-w-xs mx-auto text-sm leading-relaxed">
                  เลือกผู้ติดต่อจากรายการเอเจนต์ที่แนะนำด้านขวาเพื่อเริ่มคุยได้เลยครับ
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/conversations/${conv.id}`}
                    className="group flex items-center justify-between bg-[#111118]/40 hover:bg-[#111118] border border-white/5 hover:border-amber-500/40 rounded-[32px] p-6 transition-all duration-500"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[20px] bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500 shadow-lg">
                        <User className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-white transition-colors">
                          {conv.user2Id === 1 ? 'ระบบ / แอดมิน' : `แชทกับผู้ใช้ #${conv.user1Id === currentUser?.id ? conv.user2Id : conv.user1Id}`}
                        </h3>
                        <div className="flex items-center gap-4 text-white/30 text-[10px] mt-2 uppercase font-black tracking-widest leading-none">
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            {new Date(conv.createdAt).toLocaleDateString('th-TH')}
                          </span>
                          {conv.propertyId && (
                             <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                PROPERTY #{conv.propertyId}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-amber-500 transition-all duration-500 text-white/20 group-hover:text-black group-hover:translate-x-1">
                       <ChevronRight className="w-6 h-6" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: New Chat / People */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-2">
               <Users className="w-3.5 h-3.5" />
               เอเจนต์แนะนำ
            </h2>

            <div className="bg-[#111118]/80 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 space-y-5 shadow-2xl">
               {availableUsers.length === 0 ? (
                  <p className="text-center py-12 text-white/20 text-[10px] font-black uppercase tracking-[0.2em] italic">
                     - ไม่พบรายชื่อผู้ใช้ -
                  </p>
               ) : availableUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-5 rounded-[28px] bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 group">
                     <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500">
                             <User className="w-6 h-6" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-4 border-[#111118]" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1">{user.username || `Agent #${user.id}`}</p>
                           <p className="text-[10px] text-white/20 uppercase font-bold tracking-tighter mt-0.5">ออนไลน์ตลอดเวลา</p>
                        </div>
                     </div>
                     <button
                        onClick={() => handleStartChat(user)}
                        disabled={creating !== null}
                        className={`p-3 rounded-2xl transition-all active:scale-90 shadow-xl ${
                          creating === user.id 
                            ? 'bg-amber-500 text-black animate-pulse' 
                            : 'bg-white/5 hover:bg-amber-500 text-white/40 hover:text-black'
                        }`}
                     >
                        {creating === user.id ? (
                           <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                           <Plus className="w-5 h-5" />
                        )}
                     </button>
                  </div>
               ))}
               
               <div className="pt-6 mt-6 border-t border-white/5">
                  <div className="p-5 rounded-[24px] bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                     <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-amber-500" />
                     </div>
                     <p className="text-[11px] text-amber-500/70 font-medium leading-relaxed">
                        ทิป: การเริ่มต้นสนทนาด้วยรายละเอียดที่ครบถ้วน จะช่วยให้เอเจนต์บริการคุณได้รวดเร็วขึ้น
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
