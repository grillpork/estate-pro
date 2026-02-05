import { LoaderCircle } from "lucide-react";
import React from "react";

const UsersLoading = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <LoaderCircle size={20} className="animate-spin" />
    </div>
  );
};

export default UsersLoading;
