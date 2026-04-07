import React from "react";
import UserSubscriptionsList from "@/app/(admin-dashboard)/components/user-subscriptions/UserSubscriptionsList";

const UserSubscriptionsPage = () => {
  return (
    <div className="flex-1 bg-neutral-800 rounded-xl h-full">
      <UserSubscriptionsList />
    </div>
  );
};

export default UserSubscriptionsPage;
