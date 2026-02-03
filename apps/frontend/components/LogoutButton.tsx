"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";

const LogoutButton = () => {
  const router = useRouter();

  const logout = async () => {
    await authService.logout();
    router.push("/login");
    router.refresh();
  };
  return (
    <button className="p-4 bg-red-500 text-white rounded-md" onClick={logout}>
      ออกจากระบบ
    </button>
  );
};

export default LogoutButton;
