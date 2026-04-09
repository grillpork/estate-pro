"use client";

import { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  LogOut, 
  Save, 
  MapPin, 
  ChevronRight,
  Camera,
  CheckCircle2,
  Lock,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { authService } from "@/services/auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    username: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getCurrentUser();
        setUser(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phoneNumber: data.phoneNumber || "",
          username: data.username || ""
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        router.push("/auth/sign-in");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/users/${user.id}`, formData);
      
      // If there's a new image, upload it too
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);
        await api.put(`/users/${user.id}/profile-image`, imageFormData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      }
      
      alert("Profile updated successfully!");
      // Re-fetch profile to get latest image path
      const latestData = await authService.getCurrentUser();
      setUser(latestData);
      setImageFile(null); // Clear pending upload
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/auth/sign-in");
  };

  if (loading) return null;

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white pb-32">
      <Navbar />

      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative">
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-amber-500 text-xs font-black uppercase tracking-widest mb-10 transition-colors">
             <ArrowLeft size={16} /> Dashboard
          </Link>

          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4 italic">
                MY <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-600">PROFILE</span>
              </h1>
              <p className="text-white/40 text-lg font-medium">Manage your personal identity and security settings.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Account Level</p>
                 <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-xs font-black uppercase tracking-[0.2em]">{user.role || 'PRO USER'}</div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             {/* Left: Avatar & Quick Info */}
             <div className="lg:col-span-4 space-y-6">
                <div className="p-10 rounded-[3rem] bg-white/3 border border-white/5 backdrop-blur-xl flex flex-col items-center text-center">
                   <div className="relative group mb-6">
                      <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-amber-500/20 overflow-hidden">
                         {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : user.imagePath ? (
                            <img src={`http://localhost:4000/${user.imagePath}`} alt={user.firstName} className="w-full h-full object-cover" />
                          ) : (
                            user.firstName ? user.firstName[0] : user.username?.[0]
                          )}
                      </div>
                       <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center border-4 border-[#0a0a0f] hover:bg-amber-500 transition-all cursor-pointer">
                          <Camera size={18} />
                          <input 
                            id="avatar-upload"
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                       </label>
                   </div>
                   <h3 className="text-xl font-black text-white tracking-tight italic uppercase">{user.firstName} {user.lastName}</h3>
                   <p className="text-white/30 text-xs font-black uppercase tracking-widest mt-1">@{user.username}</p>
                   
                   <div className="mt-8 flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10">
                      <CheckCircle2 size={14} /> Verified Profile
                   </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-white/3 border border-white/5 backdrop-blur-xl">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6">Security Level</h4>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                               <Shield size={16} />
                            </div>
                            <span className="text-xs font-bold text-white/80">Personal Data</span>
                         </div>
                         <ChevronRight size={14} className="text-white/20" />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                               <Lock size={16} />
                            </div>
                            <span className="text-xs font-bold text-white/80">Two-Factor Auth</span>
                         </div>
                         <ChevronRight size={14} className="text-white/20" />
                      </div>
                   </div>
                </div>
             </div>

             {/* Right: Detailed Form */}
             <div className="lg:col-span-8">
                <div className="p-10 rounded-[3rem] bg-white/3 border border-white/5 backdrop-blur-xl">
                   <h4 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-10 flex items-center gap-3">
                      <User size={18} /> Personal Information
                   </h4>
                   
                   <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">First Name</label>
                        <div className="relative">
                           <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                           <input 
                             type="text" 
                             value={formData.firstName}
                             onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all" 
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Last Name</label>
                        <div className="relative">
                           <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                           <input 
                             type="text" 
                             value={formData.lastName}
                             onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all" 
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Username</label>
                        <div className="relative">
                           <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                           <input 
                             type="text" 
                             value={formData.username}
                             onChange={(e) => setFormData({...formData, username: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all" 
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Phone Number</label>
                        <div className="relative">
                           <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                           <input 
                             type="text" 
                             value={formData.phoneNumber}
                             onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-amber-500/50 transition-all" 
                           />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Email Address</label>
                        <div className="relative">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                           <input 
                             type="email" 
                             value={user.email}
                             disabled
                             className="w-full bg-white/3 border border-white/5 text-white/30 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold cursor-not-allowed" 
                           />
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-8 flex items-center justify-between">
                         <button
                           type="button"
                           onClick={handleLogout}
                           className="flex items-center gap-2 text-white/30 hover:text-red-500 text-xs font-black uppercase tracking-widest transition-colors"
                         >
                            <LogOut size={16} /> Sign out of account
                         </button>
                         <button 
                           disabled={saving}
                           className="bg-white text-black px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center gap-2 shadow-2xl shadow-white/5"
                         >
                           <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
                         </button>
                      </div>
                   </form>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
