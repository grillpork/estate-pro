import React from "react";
import MembershipPlansList from "@/app/(admin-dashboard)/components/membership-plans/MembershipPlansList";

const MembershipPlansPage = () => {
  return (
    <div className="flex-1 bg-neutral-800 rounded-xl h-full">
      <MembershipPlansList />
    </div>
  );
};

export default MembershipPlansPage;
