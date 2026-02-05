import React from "react";
import UserLists from "@/app/(admin-dashboard)/components/users/UserLists";

const page = () => {
  return (
    <div className=" flex-1 bg-neutral-800 rounded-xl h-full">
      <UserLists />
    </div>
  );
};

export default page;
