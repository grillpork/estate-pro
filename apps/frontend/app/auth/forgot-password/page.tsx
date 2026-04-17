"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/auth";

const forgotSchema = z.object({
    email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotFormData>({
        resolver: zodResolver(forgotSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: ForgotFormData) => {
        setError(null);
        const result = await authService.forgotPassword(data.email);
        if (result.success) {
            setSubmitted(true);
        } else {
            setError(result.error || "เกิดข้อผิดพลาด");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-12 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-600/8 blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-md">
                <div className="bg-[#111118] border border-white/8 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 mb-4 shadow-lg shadow-amber-500/25">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            ลืมรหัสผ่าน
                        </h1>
                        <p className="text-white/40 text-sm mt-1">
                            กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
                        </p>
                    </div>

                    {submitted ? (
                        /* Success State */
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <CheckCircle2 size={32} className="text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white mb-2">ส่งลิงก์แล้ว!</h2>
                                <p className="text-white/50 text-sm">
                                    หากมีบัญชีที่ใช้อีเมลนี้ เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปแล้ว
                                    กรุณาตรวจสอบกล่องข้อความของคุณ
                                </p>
                            </div>
                            <Link
                                href="/auth/sign-in"
                                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                            >
                                <ArrowLeft size={16} /> กลับไปหน้าเข้าสู่ระบบ
                            </Link>
                        </div>
                    ) : (
                        /* Form */
                        <>
                            {error && (
                                <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                                    <span className="mt-0.5 shrink-0">⚠</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="forgot-email" className="block text-sm font-medium text-white/70">
                                        อีเมล
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                        <input
                                            {...register("email")}
                                            id="forgot-email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="example@email.com"
                                            className={`w-full bg-white/5 border ${errors.email
                                                    ? "border-red-500/50 focus:border-red-500"
                                                    : "border-white/10 focus:border-amber-500/60"
                                                } text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all duration-200 focus:bg-white/8 focus:ring-2 ${errors.email ? "focus:ring-red-500/20" : "focus:ring-amber-500/15"
                                                }`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> กำลังส่ง...
                                        </>
                                    ) : (
                                        "ส่งลิงก์รีเซ็ตรหัสผ่าน"
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
                    )}
                </div>
            </div>
        </div>
    );
}
