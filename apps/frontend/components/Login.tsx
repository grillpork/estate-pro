"use client";
import { authService } from "@/services/auth";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginCredentails } from "@/services/auth";

//validate schema
const loginSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมล"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัว"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  //กำหนดค่าเริ่มต้นของฟอร์ม
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  //submit login function
  const submitLogin = async (data: LoginFormData) => {
    setError(null);

    const credentials: LoginCredentails = {
      email: data.email,
      password: data.password,
    };

    //แก้ไปใช้ authService
    const result = await authService.login(credentials);

    if (result.success as any) {
      //ถ้าเงื่อนไขการ login สำเร็จ ไปหน้าแรก
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "เกิดข้อผิดพลาดในการ login");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(submitLogin)}>
        {/* error message */}
        {error && <p className="text-red-500">{error}</p>}

        {/* email section */}
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
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </div>
  );
};

export default Login;
