"use client";

import { useSession } from "@/lib/auth-client";
import LogoutButton from "./LogoutButton";
import { redirect } from "next/navigation";

const UserBox = ({
  variant = "default",
}: {
  variant?: "default" | "ghost";
}) => {
  const { data: session, isPending } = useSession();

  if (isPending)
    return <div className="text-white text-xs p-2">Loading...</div>;

  if (!session)
    return (
      <button
        className="bg-indigo-600 cursor-pointer text-white p-2 rounded-xl w-full text-xs font-medium hover:bg-indigo-700 transition-colors"
        onClick={() => redirect("/login")}
      >
        Sign in
      </button>
    );

  const containerClass =
    variant === "ghost"
      ? "bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10"
      : "bg-neutral-800 border border-neutral-700";

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-xl transition-all duration-200 group ${containerClass}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <img
          className="w-9 h-9 rounded-lg object-cover bg-neutral-700"
          src={
            session.user.image ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmn4pWrDE1f07NiO_-ALAPW18mUchf6vj9oA&s"
          }
          alt={session.user.name || "User"}
        />
        <div className="flex flex-col overflow-hidden">
          <p className="text-sm font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
            {session.user.name || "User"}
          </p>
          <p className="text-[10px] text-neutral-400 truncate">
            {session.user.email}
          </p>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <LogoutButton />
      </div>
    </div>
  );
};

export default UserBox;
