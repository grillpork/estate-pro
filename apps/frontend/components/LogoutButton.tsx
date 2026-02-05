"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const router = useRouter();

  const logout = async () => {
    await authService.logout();
    router.push("/login");
    router.refresh();
  };
  return (
    <button className="p-2 text-white rounded-md" onClick={logout}>
      <LogOut size={16} />
    </button>
  );
};

export default LogoutButton;
