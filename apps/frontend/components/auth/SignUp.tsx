"use client";

import { authService, RegisterCredentails } from "@/services/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const registerSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const SignUp = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  });

  const passwordValue = watch("password");

  const passwordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(passwordValue || "");
  const strengthLabel = ["", "อ่อนแอ", "พอใช้", "ดี", "แข็งแกร่ง"][strength];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-blue-400", "bg-emerald-500"][strength];

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    const credentials: RegisterCredentails = {
      email: data.email,
      password: data.password,
    };
    const result = await authService.register(credentials);
    if (result.success) {
      router.push("/auth/sign-in?registered=true");
      router.refresh();
    } else {
      setError(result.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/8 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 mb-4 shadow-lg shadow-amber-500/25">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              สร้างบัญชีใหม่
            </h1>
            <p className="text-white/40 text-sm mt-1">
              เริ่มต้นจัดการอสังหาริมทรัพย์ของคุณวันนี้
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="block text-sm font-medium text-white/70">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  {...register("email")}
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  className={`w-full bg-white/5 border ${
                    errors.email ? "border-red-500/50" : "border-white/10 focus:border-amber-500/60"
                  } text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all duration-200 focus:bg-white/8 focus:ring-2 ${
                    errors.email ? "focus:ring-red-500/20" : "focus:ring-amber-500/15"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="block text-sm font-medium text-white/70">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  {...register("password")}
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className={`w-full bg-white/5 border ${
                    errors.password ? "border-red-500/50" : "border-white/10 focus:border-amber-500/60"
                  } text-white placeholder-white/20 rounded-xl pl-10 pr-12 py-3 text-sm outline-none transition-all duration-200 focus:bg-white/8 focus:ring-2 ${
                    errors.password ? "focus:ring-red-500/20" : "focus:ring-amber-500/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {passwordValue && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColor : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/40">
                    ความแข็งแกร่ง:{" "}
                    <span className={strength >= 3 ? "text-emerald-400" : strength === 2 ? "text-yellow-400" : "text-red-400"}>
                      {strengthLabel}
                    </span>
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password.message}</p>
              )}
            </div>



            {/* Terms */}
            <p className="text-xs text-white/30 leading-relaxed">
              การสมัครสมาชิกถือว่าคุณยอมรับ{" "}
              <Link href="/terms" className="text-amber-400/70 hover:text-amber-400 transition-colors underline underline-offset-2">
                ข้อกำหนดการใช้งาน
              </Link>{" "}
              และ{" "}
              <Link href="/privacy" className="text-amber-400/70 hover:text-amber-400 transition-colors underline underline-offset-2">
                นโยบายความเป็นส่วนตัว
              </Link>
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                <>
                  สมัครสมาชิก
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-white/35">
            มีบัญชีแล้ว?{" "}
            <Link
              href="/auth/sign-in"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
