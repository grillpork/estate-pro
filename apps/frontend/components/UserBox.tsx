"use client";

import { useSession } from "@/lib/auth-client";
import LogoutButton from "./LogoutButton";
import { redirect } from "next/navigation";

const UserBox = () => {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>กำลังโหลด...</div>;
  if (!session)
    return (
      <button
        className="bg-blue-500 cursor-pointer text-white p-2 rounded-xl w-full"
        onClick={() => redirect("/login")}
      >
        กรุณาเข้าสู่ระบบ
      </button>
    );

  return (
    <div className="flex items-center gap-2 text-white p-2 bg-neutral-800 rounded-xl">
      <div className="flex  gap-2">
        <img
          className="w-10 h-10 rounded-md"
          src={
            session.user.image ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmn4pWrDE1f07NiO_-ALAPW18mUchf6vj9oA&s"
          }
          alt={session.user.name || "ไม่พบชื่อ"}
        />
        <div className="flex flex-col ">
          <p>{session.user.name || "ไม่พบชื่อ"}</p>
          <p className="text-sm text-neutral-400">{session.user.email}</p>
        </div>
      </div>
      <LogoutButton />
    </div>
  );
};

export default UserBox;
