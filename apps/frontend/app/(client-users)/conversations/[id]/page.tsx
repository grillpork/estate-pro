"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  Send,
  User,
  ArrowLeft,
  RefreshCw,
  Bot,
} from "lucide-react";
import Link from "next/link";

export default function ChatRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for user in localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/auth/sign-in');
      return;
    }
    setCurrentUser(JSON.parse(userStr));

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/conversations/${id}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    // จำลอง Real-time ด้วย polling ทุก 3 วินาที (หากมี Socket.io จะดีกว่านี้ครับ)
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      // ใช้ setTimeout สั้นๆ เพื่อให้มั่นใจว่า DOM เรนเดอร์เสร็จแล้ว
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(`/conversations/${id}/messages`, {
        content: newMessage,
      });
      setMessages([...messages, response.data]);
      setNewMessage("");
      // เลื่อนลงทันทีเมื่อส่งเอง
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="bg-[#0a0a0f] h-screen flex flex-col text-white pt-14">
      <Navbar />
      
      {/* Header */}
      <div className="bg-[#111118]/50 backdrop-blur-md border-b border-white/5 py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/conversations" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm">แชทของคุณ (ห้อง #{id})</h2>
                <div className="flex items-center gap-1.5 text-[10px] text-green-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  เชื่อมต่อแล้ว (Polling 3s)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative max-w-4xl w-full mx-auto flex flex-col sm:flex-row">
        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth"
        >
          {loading ? (
             <div className="flex justify-center p-20">
               <RefreshCw className="w-8 h-8 animate-spin text-amber-500/20" />
             </div>
          ) : messages.length === 0 ? (
             <div className="text-center p-20 text-white/10 uppercase tracking-widest text-xs font-bold">
                เริ่มการสนทนาได้เลยครับ
             </div>
          ) : messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    isMe
                      ? "bg-amber-500 text-black rounded-tr-none font-medium"
                      : "bg-[#111118] border border-white/5 text-white/90 rounded-tl-none shadow-lg"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-2 ${isMe ? "text-black/40" : "text-white/20"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Webhook Testing Info (Sidebar on large screens) */}
        {/* <div className="w-full sm:w-64 bg-[#111118]/30 border-t sm:border-t-0 sm:border-l border-white/5 p-4 hidden lg:block">
           <div className="flex items-center gap-2 text-amber-500 mb-4 px-1">
              <Bot className="w-4 h-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Webhook Support</h4>
           </div>
           <p className="text-[11px] text-white/40 leading-relaxed mb-4">
              คุณสามารถส่งแชทจากภายนอกมาที่ห้องนี้ได้ โดยยิง POST ไปมาที่:
           </p>
           <div className="bg-black/40 rounded-xl p-3 text-[10px] font-mono text-amber-400/60 break-all border border-white/5">
              POST /webhook/messages<br/>
              {`{ "conversationId": ${id}, "content": "..." }`}
           </div>
        </div>
      </div> */}

      {/* Input Area */}
      <div className="bg-[#111118]/80 backdrop-blur-md border-t border-white/5 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="พิมพ์ข้อความของคุณที่นี่..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-black p-3 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
