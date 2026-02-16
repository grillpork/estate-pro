import { LoaderCircle } from "lucide-react";
import React from "react";

const UsersLoading = () => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <LoaderCircle size={20} className="animate-spin" color="#fff" />
    </div>
  );
};

export default UsersLoading;
