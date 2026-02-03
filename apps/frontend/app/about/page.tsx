import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div>
      <Link href={"/"}>Home</Link>
      <LogoutButton/>
    </div>
  );
};

export default page;
