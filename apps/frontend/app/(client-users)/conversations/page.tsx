"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { 
  MessageSquare, User, Calendar, ChevronRight, Users, Star, Plus, 
  Trash2, Send, ArrowLeft, RefreshCw, Bot, Info
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MessengerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  // List States
  const [conversations, setConversations] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [creating, setCreating] = useState<number | null>(null);

  // Chat Room States
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial data (Conversations & Users)
  useEffect(() => {
    const initData = async () => {
      let user = null;
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          user = JSON.parse(userStr);
          setCurrentUser(user);
        } catch (e) { console.error("User parse error"); }
      }

      if (!user) {
        try {
          const meRes = await api.get("/auth/me");
          if (meRes.data) {
            user = meRes.data;
            setCurrentUser(user);
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (e) {
          alert("กรุณาเข้าสู่ระบบก่อนใช้งานครับ");
          router.push("/auth/sign-in");
          return;
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
        console.error("Fetch data error:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Fetch messages when selectedId changes
  useEffect(() => {
    if (!selectedId) {
        setMessages([]);
        return;
    }

    const fetchMessages = async () => {
      try {
        if (!messagesLoading && messages.length === 0) setMessagesLoading(true);
        const res = await api.get(`/conversations/${selectedId}/messages`);
        setMessages(res.data || []);
      } catch (e) {
        console.error("Fetch messages error:", e);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling
    return () => clearInterval(interval);
  }, [selectedId]);

  // Auto Scroll to bottom
  const scrollToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => scrollToBottom("smooth"), 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const handleStartChat = async (targetUser: any) => {
    if (!currentUser) return;
    setCreating(targetUser.id);
    try {
      const res = await api.post("/conversations", {
        user1Id: currentUser.id,
        user2Id: targetUser.id,
      });
      if (res.data) {
        setSelectedId(res.data.id.toString());
        // Refresh list
        const convRes = await api.get("/conversations");
        setConversations(convRes.data);
      }
    } catch (error) {
      console.error("Start chat error:", error);
    } finally {
      setCreating(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId) return;

    try {
      const response = await api.post(`/conversations/${selectedId}/messages`, {
        content: newMessage,
      });
      setMessages([...messages, response.data]);
      setNewMessage("");
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("ลบห้องสนทนานี้ถาวร?")) return;
    try {
      await api.delete(`/conversations/${id}`);
      setConversations(conversations.filter(c => c.id.toString() !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (e) { console.error("Delete error:", e); }
  };

  // UI Helpers
  const getOtherUser = (conv: any) => {
    const otherId = conv.user1Id === currentUser?.id ? conv.user2Id : conv.user1Id;
    return otherId === 1 ? { username: 'แอดมิน / ทีมงาน', id: 1 } : availableUsers.find(u => u.id === otherId) || { username: `สมาชิก #${otherId}`, id: otherId };
  };

  return (
    <div className="bg-[#0a0a0f] h-screen flex flex-col text-white pt-16 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto overflow-hidden divide-x divide-white/5">
        
        {/* Sidebar: Conversations & Agents */}
        <div className={`flex-col bg-[#111118]/20 w-full sm:w-80 lg:w-[380px] ${selectedId ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-6 border-b border-white/5">
             <h1 className="text-2xl font-black tracking-tight mb-2">ข้อความ</h1>
             <p className="text-white/30 text-xs font-medium uppercase tracking-widest"> Direct Messages </p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-8 pb-10">
             
             {/* Section: Chats */}
             <div className="space-y-4">
                <h2 className="px-3 text-[10px] font-black uppercase text-amber-500/60 tracking-[0.2em] flex items-center gap-2">
                   <MessageSquare className="w-3 h-3" /> แชทล่าสุด
                </h2>
                {loading ? (
                  <div className="p-10 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-white/10" /></div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center bg-white/5 rounded-3xl mx-3">
                     <p className="text-xs text-white/20">ยังไม่มีการสนทนา</p>
                  </div>
                ) : conversations.map(conv => {
                  const other = getOtherUser(conv);
                  const isSelected = selectedId === conv.id.toString();
                  return (
                    <div 
                      key={conv.id}
                      onClick={() => setSelectedId(conv.id.toString())}
                      className={`group relative flex items-center justify-between p-4 rounded-3xl cursor-pointer transition-all duration-300 ${
                        isSelected ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden shadow-inner">
                           {/* @ts-ignore */}
                           {other.avatar ? <img className="w-full h-full object-cover" src={other.avatar} alt="v" /> : <User className={`w-6 h-6 ${isSelected ? 'text-black/40' : 'text-white/20'}`} />}
                        </div>
                        <div>
                          {/* @ts-ignore */}
                          <h3 className={`font-black text-sm tracking-tight ${isSelected ? 'text-black' : 'text-white/80'}`}>{other.username}</h3>
                          <p className={`text-[10px] font-bold ${isSelected ? 'text-black/50' : 'text-white/20'}`}>คลิกเพื่ออ่าน</p>
                        </div>
                      </div>
                      {!isSelected && (
                         <button onClick={(e) => handleDelete(e, conv.id.toString())} className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      )}
                    </div>
                  );
                })}
             </div>

             {/* Section: Recommended Agents */}
             <div className="space-y-4">
                <h2 className="px-3 text-[10px] font-black uppercase text-white/30 tracking-[0.2em] flex items-center gap-2">
                   <Users className="w-3 h-3" /> เอเจนต์ที่แนะนำ
                </h2>
                <div className="grid gap-2 px-1">
                   {availableUsers.slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
                               <User className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">{user.username || `User #${user.id}`}</p>
                         </div>
                         <button 
                            onClick={() => handleStartChat(user)}
                            className="p-2 rounded-xl hover:bg-amber-500 hover:text-black transition-all"
                         >
                            {creating === user.id ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Plus className="w-4 h-4" />}
                         </button>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-[#0a0a0f] relative ${!selectedId ? 'hidden sm:flex' : 'flex'}`}>
           {selectedId ? (
              <>
                {/* Chat Header */}
                <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#111118]/20 backdrop-blur-xl shrink-0">
                   <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedId(null)} className="sm:hidden p-2 bg-white/5 rounded-xl"><ArrowLeft className="w-5 h-5"/></button>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
                         <User className="w-6 h-6" />
                      </div>
                      <div>
                         <h2 className="font-black text-lg tracking-tight">
                            {/* @ts-ignore */}
                            {getOtherUser(conversations.find(c => c.id.toString() === selectedId) || {}).username}
                         </h2>
                         <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold uppercase tracking-tighter">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> ออนไลน์
                         </div>
                      </div>
                   </div>
                </div>

                {/* Messages Container */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('/grid-dark.png')] bg-repeat"
                >
                   {messagesLoading ? (
                      <div className="flex justify-center p-20 text-white/5"><RefreshCw className="w-10 h-10 animate-spin" /></div>
                   ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-white/10 space-y-4">
                         <MessageSquare className="w-16 h-16 opacity-50" />
                         <p className="text-sm font-black uppercase tracking-widest"> เริ่มส่งข้อความแรกของคุณ </p>
                      </div>
                   ) : messages.map((msg, idx) => {
                      const isMe = msg.senderId === currentUser?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[75%] p-4 rounded-[28px] shadow-2xl transition-all hover:scale-[1.02] ${
                              isMe ? 'bg-amber-500 text-black font-bold rounded-tr-none' : 'bg-[#111118] border border-white/5 text-white/90 rounded-tl-none'
                           }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              <p className={`text-[9px] mt-2 opacity-30 ${isMe ? 'text-black' : 'text-white'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        </div>
                      )
                   })}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-[#111118]/40 border-t border-white/5 shrink-0">
                   <form onSubmit={handleSend} className="flex gap-4">
                      <div className="flex-1 relative">
                        <input 
                           type="text" 
                           value={newMessage}
                           onChange={e => setNewMessage(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-2xl px-6 py-4 text-sm outline-none transition-all pr-12"
                           placeholder="Type a message..."
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10"><MessageSquare className="w-5 h-5" /></div>
                      </div>
                      <button 
                         type="submit"
                         className="bg-amber-500 hover:bg-amber-400 text-black w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-amber-500/20 active:scale-90"
                      >
                         <Send className="w-6 h-6" />
                      </button>
                   </form>
                </div>
              </>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-20 group">
                 <div className="w-32 h-32 rounded-[40px] bg-white/5 flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                    <Bot className="w-16 h-16" />
                 </div>
                 <h3 className="text-2xl font-black tracking-tight mb-2">Messenger ของคุณ</h3>
                 <p className="text-sm max-w-xs mx-auto">เลือกคนคุยเพื่อเริ่มแชทแบบ 1:1 ได้ทันทีครับ</p>
                 <div className="mt-10 flex items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 animate-pulse">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Premium 1:1 Chat Experience</span>
                 </div>
              </div>
           )}
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
