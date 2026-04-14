"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  MessageSquare,
  User,
  Send,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const PROPERTY_CARD_PREFIX = "__PROPERTY_CARD__:";

type UserLite = {
  id: number;
  username: string;
  avatar?: string | null;
  imagePath?: string | null;
  lastSeen?: string | null;
};

type Conversation = {
  id: number;
  user1Id: number;
  user2Id: number;
  propertyId?: number | null;
};

type Message = {
  id: number;
  conversationId: number;
  senderId: number | null;
  content: string;
  createdAt: string;
};

type PropertyCardPayload = {
  propertyId: number;
  name?: string;
  price?: number;
  district?: string;
  province?: string;
  imageUrl?: string | null;
  url?: string;
};

export default function MessengerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  // List States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserLite | null>(null);
  // Chat Room States
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const shouldForceScrollRef = useRef(false);

  // Fetch initial data (Conversations & Users)
  useEffect(() => {
    const initData = async () => {
      let user: UserLite | null = null;
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          user = JSON.parse(userStr) as UserLite;
          setCurrentUser(user);
        } catch {
          console.error("User parse error");
        }
      }

      if (!user) {
        try {
          const meRes = await api.get("/auth/me");
          if (meRes.data) {
            user = meRes.data;
            setCurrentUser(user);
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch {
          alert("กรุณาเข้าสู่ระบบก่อนใช้งานครับ");
          router.push("/auth/sign-in");
          return;
        }
      }

      try {
        const [convRes, userRes] = await Promise.all([
          api.get("/conversations"),
          api.get("/api/users"),
        ]);
        setConversations((convRes.data || []) as Conversation[]);
        setAvailableUsers(
          ((userRes.data || []) as UserLite[]).filter((u) => u.id !== user?.id),
        );
      } catch (error) {
        console.error("Fetch data error:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [router]);

  // Fetch messages when selectedId changes
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      prevMessageCountRef.current = 0;
      return;
    }

    let isActive = true;
    let isFirstLoad = true;
    shouldForceScrollRef.current = true;
    prevMessageCountRef.current = 0;

    const fetchMessages = async () => {
      try {
        if (isFirstLoad) {
          setMessagesLoading(true);
        } else if (typeof document !== "undefined" && document.hidden) {
          return;
        }

        const res = await api.get(`/conversations/${selectedId}/messages`);
        if (!isActive) return;

        const nextMessages = (res.data || []) as Message[];
        setMessages((prevMessages) => {
          const unchanged =
            prevMessages.length === nextMessages.length &&
            prevMessages.every(
              (m: Message, i: number) =>
                m.id === nextMessages[i]?.id &&
                m.content === nextMessages[i]?.content &&
                m.createdAt === nextMessages[i]?.createdAt,
            );
          return unchanged ? prevMessages : nextMessages;
        });
      } catch (e) {
        console.error("Fetch messages error:", e);
      } finally {
        if (isFirstLoad && isActive) {
          setMessagesLoading(false);
        }
        isFirstLoad = false;
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [selectedId]);

  // Auto Scroll to bottom
  const scrollToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || messages.length === 0) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 120;
    const hasNewMessage = messages.length > prevMessageCountRef.current;

    if (shouldForceScrollRef.current || (hasNewMessage && isNearBottom)) {
      scrollToBottom(prevMessageCountRef.current === 0 ? "auto" : "smooth");
      shouldForceScrollRef.current = false;
    }

    prevMessageCountRef.current = messages.length;
  }, [messages, selectedId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId) return;

    try {
      const response = await api.post(`/conversations/${selectedId}/messages`, {
        content: newMessage,
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        response.data as Message,
      ]);
      setNewMessage("");
      shouldForceScrollRef.current = true;
    } catch (error) {
      console.error("Send error:", error);
    }
  };
  // Heartbeat Effect
  useEffect(() => {
    if (!currentUser) return;
    const heartbeat = () => api.post("/auth/heartbeat").catch(() => {});
    heartbeat();
    const interval = setInterval(heartbeat, 25000); // 25s
    return () => clearInterval(interval);
  }, [currentUser]);

  // UI Helpers
  const getOtherUser = (conv: Conversation | undefined): UserLite => {
    if (!conv) {
      return { id: 0, username: "Unknown user" };
    }

    const otherId =
      conv.user1Id === currentUser?.id ? conv.user2Id : conv.user1Id;
    return otherId === 1
      ? { username: "แอดมิน / ทีมงาน", id: 1 }
      : availableUsers.find((u) => u.id === otherId) || {
          username: `สมาชิก #${otherId}`,
          id: otherId,
        };
  };

  const isOnline = (user?: UserLite | null) => {
    if (!user || !user.lastSeen) return false;
    const lastSeenDate = new Date(user.lastSeen);
    const now = new Date();
    // ถ้าขยับล่าสุดไม่เกิน 60 วินาที ถือว่าออนไลน์
    return now.getTime() - lastSeenDate.getTime() < 60000;
  };

  const parsePropertyCard = (content: string): PropertyCardPayload | null => {
    if (!content || typeof content !== "string") return null;
    if (!content.startsWith(PROPERTY_CARD_PREFIX)) return null;

    try {
      const payload = JSON.parse(
        content.replace(PROPERTY_CARD_PREFIX, ""),
      ) as Partial<PropertyCardPayload>;
      if (!payload?.propertyId) return null;
      return payload as PropertyCardPayload;
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-[#0a0a0f] h-screen flex flex-col text-white pt-16 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto overflow-hidden divide-x divide-white/5">
        {/* Sidebar: Conversations */}
        <div
          className={`flex-col bg-[#111118]/20 w-full sm:w-80 lg:w-[380px] ${selectedId ? "hidden sm:flex" : "flex"}`}
        >
          <div className="p-6 border-b border-white/5">
            <h1 className="text-2xl font-black tracking-tight mb-2">ข้อความ</h1>
            <p className="text-white/30 text-xs font-medium uppercase tracking-widest">
              {" "}
              Direct Messages{" "}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 pb-10">
            {/* Section: Chats */}
            <div className="space-y-4">
              <h2 className="px-3 text-[10px] font-black uppercase text-amber-500/60 tracking-[0.2em] flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> แชทล่าสุด
              </h2>
              {loading ? (
                <div className="p-10 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-white/10" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center bg-white/5 rounded-3xl mx-3">
                  <p className="text-xs text-white/20">ยังไม่มีการสนทนา</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherUser(conv);
                  const isSelected = selectedId === conv.id.toString();
                  const online = isOnline(other);

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedId(conv.id.toString())}
                      className={`group relative flex items-center justify-between p-4 rounded-3xl cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "bg-amber-500 text-black shadow-xl shadow-amber-500/10"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden shadow-inner">
                            {other.avatar || other.imagePath ? (
                              <Image
                                className="w-full h-full object-cover"
                                src={
                                  other.avatar || `http://localhost:4000/${other.imagePath}`
                                }
                                alt="avatar"
                                width={48}
                                height={48}
                                unoptimized
                              />
                            ) : (
                              <User
                                className={`w-6 h-6 ${isSelected ? "text-black/40" : "text-white/20"}`}
                              />
                            )}
                          </div>
                          {online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#111118]" />
                          )}
                        </div>
                        <div>
                          <h3
                            className={`font-black text-sm tracking-tight ${isSelected ? "text-black" : "text-white/80"}`}
                          >
                            {other.username}
                          </h3>
                          <p
                            className={`text-[10px] font-bold ${isSelected ? "text-black/50" : "text-white/20"}`}
                          >
                            {online ? "กำลังใช้งาน" : "คลิกเพื่ออ่าน"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-[#0a0a0f] relative ${!selectedId ? "hidden sm:flex" : "flex"}`}
        >
          {selectedId ? (
            <>
              {/* Chat Header */}
              <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#111118]/20 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="sm:hidden p-2 bg-white/5 rounded-xl"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-black text-lg tracking-tight">
                      {
                        getOtherUser(
                          conversations.find(
                            (c) => c.id.toString() === selectedId,
                          ),
                        ).username
                      }
                    </h2>
                    {isOnline(
                      getOtherUser(
                        conversations.find(
                          (c) => c.id.toString() === selectedId,
                        ),
                      ),
                    ) ? (
                      <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold uppercase tracking-tighter">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>{" "}
                        ออนไลน์
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-bold uppercase tracking-tighter">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>{" "}
                        ออฟไลน์
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('/grid-dark.png')] bg-repeat"
              >
                {messagesLoading ? (
                  <div className="flex justify-center p-20 text-white/5">
                    <RefreshCw className="w-10 h-10 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/10 space-y-4">
                    <MessageSquare className="w-16 h-16 opacity-50" />
                    <p className="text-sm font-black uppercase tracking-widest">
                      {" "}
                      เริ่มส่งข้อความแรกของคุณ{" "}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.id;
                    const propertyCard = parsePropertyCard(msg.content);
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-4 rounded-[28px] shadow-2xl ${
                            isMe
                              ? "bg-amber-500 text-black font-bold rounded-tr-none"
                              : "bg-[#111118] border border-white/5 text-white/90 rounded-tl-none"
                          }`}
                        >
                          {propertyCard ? (
                            <a
                              href={propertyCard.url || `/properties/${propertyCard.propertyId}`}
                              className="block"
                            >
                              <div
                                className={`overflow-hidden rounded-2xl border cursor-pointer ${isMe ? "border-black/20 bg-black/10" : "border-white/10 bg-white/5"}`}
                              >
                                {propertyCard.imageUrl ? (
                                  <Image
                                    src={propertyCard.imageUrl}
                                    alt={propertyCard.name || "property cover"}
                                    width={800}
                                    height={320}
                                    className="w-full h-44 object-cover"
                                    unoptimized
                                  />
                                ) : null}
                                <div className="p-3 space-y-1.5">
                                  <p className="text-[10px] uppercase tracking-wider opacity-70">
                                    Property
                                  </p>
                                  <p className="text-sm font-black leading-snug">
                                    {propertyCard.name || `Property #${propertyCard.propertyId}`}
                                  </p>
                                  <p className="text-xs opacity-80">
                                    {propertyCard.district && propertyCard.province
                                      ? `${propertyCard.district}, ${propertyCard.province}`
                                      : "-"}
                                  </p>
                                  <p className="text-sm font-black">
                                    ฿{Intl.NumberFormat("th-TH").format(propertyCard.price || 0)}
                                  </p>
                                </div>
                              </div>
                            </a>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}
                          <p
                            className={`text-[9px] mt-2 opacity-30 ${isMe ? "text-black" : "text-white"}`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "th-TH",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 bg-[#111118]/40 border-t border-white/5 shrink-0">
                <form onSubmit={handleSend} className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-2xl px-6 py-4 text-sm outline-none transition-all pr-12"
                      placeholder="Type a message..."
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10">
                      <MessageSquare className="w-5 h-5" />
                    </div>
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
              <h3 className="text-2xl font-black tracking-tight mb-2">
                Messenger
              </h3>
              <p className="text-sm max-w-xs mx-auto">กรุณาเลือกคู่สนทนา</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
