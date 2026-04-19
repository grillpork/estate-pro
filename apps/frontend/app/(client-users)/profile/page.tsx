"use client";

import { useEffect, useState, useRef } from "react";
import {
  User, Mail, Phone, Camera, ShieldCheck,
  Calendar, Loader2, Save, ArrowLeft,
  Settings, Key, Bell, CreditCard, Crown, LogOut
} from "lucide-react";
import { userService, UpdateUserDto } from "@/services/client/users";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateUserDto>({
    username: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const trimmed = digits.slice(0, 10);
    if (trimmed.length <= 3) return trimmed;
    if (trimmed.length <= 6) return `${trimmed.slice(0, 3)}-${trimmed.slice(3)}`;
    return `${trimmed.slice(0, 3)}-${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setUser(data);
      setFormData({
        username: data.username || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phoneNumber: data.phoneNumber ? formatPhoneNumber(data.phoneNumber) : "",
      });
    } catch (err: any) {
      if (err.status === 401) router.push("/auth/sign-in");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (formData.phoneNumber && formData.phoneNumber.replace(/\D/g, "").length !== 10) {
      setError("เบอร์โทรศัพท์ต้องครบ 10 หลัก");
      setSaving(false);
      return;
    }

    try {
      const updated = await userService.updateProfile(user.id, formData);
      setUser(updated);
      setSuccess("บันทึกข้อมูลเรียบร้อยแล้ว");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setSaving(true);
        const updated = await userService.uploadAvatar(user.id, file);
        setUser(updated);
        setSuccess("อัปโหลดรูปภาพสำเร็จ");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f]">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white/90 selection:bg-amber-500/30">
      <Navbar />

      {/* Cover Section */}
      <div className="h-[28vh] relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-b from-amber-950/20 via-amber-900/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#0a0a0f] to-transparent" />
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent)]" />

        {/* Change Cover Button (Mock) */}
        <button className="absolute bottom-10 right-10 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold transition-all border border-white/5 opacity-0 group-hover:opacity-100">
          เปลี่ยนหน้าปก
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10">
        {/* Profile Identity */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 flex-1">
            <div className="relative group shrink-0">
              <div className="w-40 h-40 rounded-full bg-[#111118] border-[6px] border-[#0a0a0f] overflow-hidden shadow-2xl relative">
                <img
                  src={user?.imagePath
                    ? `http://localhost:4000/${user.imagePath}`
                    : "/images/userIcon.png"}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/userIcon.png";
                  }}
                />
                {/* Photo Upload Trigger */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm"
                >
                  <Camera size={32} />
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

              {/* Status dot */}
              <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-[#0a0a0f] rounded-full shadow-lg" />
            </div>

            <div className="pb-4 text-center md:text-left flex-1 min-w-0">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-black text-white tracking-tighter mb-2 truncate"
              >
                {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username}
              </motion.h1>
              <div className="flex items-center justify-center md:justify-start gap-4 text-white/50">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5 shrink-0">
                  <ShieldCheck size={14} className="text-amber-500" />
                  {user?.role || "Personal"}
                </span>
                <span className="text-xs uppercase tracking-tighter truncate">Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="pb-4 shrink-0 flex justify-center md:justify-end w-full md:w-auto">
            <Link
              href={`/user/${user?.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black font-black transition-all shadow-lg hover:shadow-amber-500/20 text-sm group"
            >
              <User size={18} className="group-hover:scale-110 transition-transform" />
              <span className="uppercase tracking-widest text-[10px] md:text-xs">Public Profile</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Notion-style Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-1">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 pl-4">Workspace</p>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 text-white font-bold transition-all text-sm group">
              <User size={18} className="text-amber-500" /> ข้อมูลส่วนตัว
            </button>
            
            <Link href="/my-subscription" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all text-sm">
              <Crown size={18} /> แพ็กเกจของฉัน
            </Link>
            <div className="pt-8 opacity-20"><hr className="border-white/10" /></div>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-bold mt-4">
              <LogOut size={18} /> ออกจากระบบ
            </button>
          </div>

          {/* Main Editing View */}
          <div className="lg:col-span-9">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Personal Info Section */}
              <section>
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                  <div className="w-2 h-6 bg-amber-500 rounded-full" />
                  <h2 className="text-xl font-bold">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b-2 border-white/5 focus:border-amber-500 py-3 text-lg font-medium outline-none transition-all placeholder:text-white/10"
                      placeholder="Enter your username..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full bg-transparent border-b-2 border-white/5 py-3 text-lg font-medium text-white/40 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b-2 border-white/5 focus:border-amber-500 py-3 text-lg font-medium outline-none transition-all placeholder:text-white/10"
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b-2 border-white/5 focus:border-amber-500 py-3 text-lg font-medium outline-none transition-all placeholder:text-white/10"
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Phone Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b-2 border-white/5 focus:border-amber-500 py-3 text-lg font-medium outline-none transition-all placeholder:text-white/10"
                        placeholder="08X-XXX-XXXX"
                        maxLength={12}
                      />
                      <Phone size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Status Section */}
              <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-10 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover:scale-125 transition-transform" />}
                  {saving ? "SAVING..." : "COMMIT CHANGES"}
                </button>

                <AnimatePresence>
                  {(success || error) && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-sm font-bold uppercase tracking-wider ${success ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {success || error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer spacer */}
      <div className="h-40" />
    </div>
  );
}
