"use client";
import { authService } from "@/services/auth";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RegisterCredentails } from "@/services/auth";

type RegisterFormData = z.infer<typeof registerSchema>;

const registerSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมล"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัว"),
});

const Register = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  //กำหนดค่าเริ่มต้นของฟอร์ม
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitRegister = async (data: RegisterFormData) => {
    setError(null);

    const credentials: RegisterCredentails = {
      email: data.email,
      password: data.password,
      name: data.email.split("@")[0],
    };

    //แก้ไปใช้ authService
    const result = await authService.register(credentials);

    if (result.success as any) {
      //ถ้าเงื่อนไขการ Register สำเร็จ ไปหน้าแรก
      router.push("/login?register=success");
      router.refresh();
    } else {
      setError(result.error || "เกิดข้อผิดพลาดในการ Register");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(submitRegister)}>
        {/* error message */}
        {error && <p className="text-red-500">{error}</p>}

        <section>
          <label htmlFor="email">อีเมล</label>
          <input {...register("email")} type="email" placeholder="ใส่อีเมล" />
        </section>

        <br />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        <section>
          <label htmlFor="password">รหัสผ่าน</label>
          <input
            {...register("password")}
            type="password"
            placeholder="ใส่รหัสผ่าน"
          />
        </section>

        <br />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
        </button>
      </form>
    </div>
  );
};

export default Register;
