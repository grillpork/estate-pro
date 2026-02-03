"use client";

import { useSession } from "@/lib/auth-client";
import LogoutButton from "./LogoutButton";

const userInfo = () => {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>กำลังโหลด...</div>;
  if (!session) return <div>กรุณาเข้าสู่ระบบ</div>;

  return (
    <div>
      <p>ชื่อซื่อ: {session.user.name || "ไม่พบชื่อ"}</p>
      <p>อีเมล: {session.user.email}</p>
      <LogoutButton/>
    </div>
  );
};

export default userInfo;
