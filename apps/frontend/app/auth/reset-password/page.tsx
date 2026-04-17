"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/auth";

const resetSchema = z
  .object({
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string().min(6, "กรุณายืนยันรหัสผ่าน"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Invalid link
  if (!token || !email) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldAlert size={32} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-2">ลิงก์ไม่ถูกต้อง</h2>
          <p className="text-white/50 text-sm">
            ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่
          </p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> ขอลิงก์ใหม่
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ResetFormData) => {
    setError(null);
    const result = await authService.resetPassword(token, email, data.password);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "เกิดข้อผิดพลาด");
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-2">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
          <p className="text-white/50 text-sm">
            รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย
          </p>
        </div>
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all text-sm"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="reset-password" className="block text-sm font-medium text-white/70">
            รหัสผ่านใหม่
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              {...register("password")}
              id="reset-password"
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
              className={`w-full bg-white/5 border ${
                errors.password
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-white/10 focus:border-amber-500/60"
              } text-white placeholder-white/20 rounded-xl pl-10 pr-12 py-3 text-sm outline-none transition-all duration-200 focus:bg-white/8 focus:ring-2 ${
                errors.password ? "focus:ring-red-500/20" : "focus:ring-amber-500/15"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="reset-confirm" className="block text-sm font-medium text-white/70">
            ยืนยันรหัสผ่านใหม่
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              {...register("confirmPassword")}
              id="reset-confirm"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className={`w-full bg-white/5 border ${
                errors.confirmPassword
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-white/10 focus:border-amber-500/60"
              } text-white placeholder-white/20 rounded-xl pl-10 pr-12 py-3 text-sm outline-none transition-all duration-200 focus:bg-white/8 focus:ring-2 ${
                errors.confirmPassword ? "focus:ring-red-500/20" : "focus:ring-amber-500/15"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> กำลังรีเซ็ต...
            </>
          ) : (
            "ตั้งรหัสผ่านใหม่"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={14} /> กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/8 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 mb-4 shadow-lg shadow-amber-500/25">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ตั้งรหัสผ่านใหม่
            </h1>
            <p className="text-white/40 text-sm mt-1">
              กรอกรหัสผ่านใหม่ที่คุณต้องการใช้งาน
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
