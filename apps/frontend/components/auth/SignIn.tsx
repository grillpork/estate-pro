"use client";

import { authService, LoginCredentails } from "@/services/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const SignIn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const credentials: LoginCredentails = {
      email: data.email,
      password: data.password,
    };
    const result = await authService.login(credentials);
    if (result.success) {
      const safeRedirect = (raw?: string | null) => {
        if (!raw) return "/";
        try {
          const decoded = decodeURIComponent(raw);
          if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
        } catch (e) {
          // ignore
        }
        return "/";
      };

      const destination = safeRedirect(from);
      router.push(destination);
      router.refresh();
    } else {
      setError(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/8 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 mb-4 shadow-lg shadow-amber-500/25">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ยินดีต้อนรับกลับมา
            </h1>
            <p className="text-white/40 text-sm mt-1">
              เข้าสู่ระบบเพื่อจัดการอสังหาริมทรัพย์ของคุณ
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signin-email" className="block text-sm font-medium text-white/70">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  {...register("email")}
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  className={`w-full bg-white/5 border ${errors.email ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-amber-500/60"
                    } text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all duration-200 focus:bg-white/8 focus:ring-2 ${errors.email ? "focus:ring-red-500/20" : "focus:ring-amber-500/15"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="signin-password" className="block text-sm font-medium text-white/70">
                  รหัสผ่าน
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-amber-400/80 hover:text-amber-400 transition-colors"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  {...register("password")}
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="รหัสผ่านของคุณ"
                  className={`w-full bg-white/5 border ${errors.password ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-amber-500/60"
                    } text-white placeholder-white/20 rounded-xl pl-10 pr-12 py-3 text-sm outline-none transition-all duration-200 focus:bg-white/8 focus:ring-2 ${errors.password ? "focus:ring-red-500/20" : "focus:ring-amber-500/15"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-500 disabled:hover:to-amber-600 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  เข้าสู่ระบบ
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-xs text-white/25">หรือ</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

    

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-white/35">
            ยังไม่มีบัญชี?{" "}
            <Link
              href={from ? `/auth/sign-up?from=${encodeURIComponent(from)}` : "/auth/sign-up"}
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              สมัครสมาชิกฟรี
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;