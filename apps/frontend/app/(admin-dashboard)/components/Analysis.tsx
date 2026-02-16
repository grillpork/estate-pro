"use client";
import { useEffect, useState } from "react";
import { adminPropertiesService } from "@/services/admin/properties";
import { adminUsersService } from "@/services/admin/users";
import { Building2, User2, AlertCircle, ArrowRight } from "lucide-react";
import ChartAnalysis from "./ChartAnalysis";
import ActivityLogs from "./ActivityLogs";
import StatCard from "./StatCard";
import AnalysisReportsList from "./AnalysisReportsList";

const Analysis = () => {
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    pendingProperties: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, propsRes] = await Promise.all([
          adminUsersService.getAllUsers(1, 1),
          adminPropertiesService.getAllProperties(),
        ]);

        // Handle users response structure (pagination vs array)
        const totalUsers =
          (usersRes as any).pagination?.total || (usersRes as any).length || 0;

        // Handle properties
        const allProps = propsRes as any[];
        const totalProps = allProps.length;
        const pendingProps = allProps.filter(
          (p) => p.status === "pending",
        ).length;

        setStats({
          users: totalUsers,
          properties: totalProps,
          pendingProperties: pendingProps,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col bg-[#0F0F12] p-6 gap-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-neutral-400 text-sm">
            Monitor key metrics and system health.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          count={stats.users}
          icon={User2}
          colorClass="bg-indigo-500/10 text-indigo-400/50"
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Pending Review"
          count={stats.pendingProperties}
          icon={AlertCircle}
          colorClass="bg-orange-500/10 text-orange-400/50"
          trend="Action Needed"
          subLabel="awaiting approval"
        />
        <StatCard
          title="Total Properties"
          count={stats.properties}
          icon={Building2}
          colorClass="bg-violet-500/10 text-violet-400/50"
          trend="+5%"
          trendUp={true}
        />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
        {/* Left Column - Chart & Reports (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Chart Section */}
          <ChartAnalysis />
          {/* Recent Reports Section */}
          <div className="bg-[#1A1A1E] border rounded-2xl border-[#27272A] p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">
                System Reports
              </h3>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
                View All <ArrowRight size={12} />
              </button>
            </div>
            <AnalysisReportsList />
          </div>
        </div>

        {/* Right Column - Approval History (1/3 width) */}
        <ActivityLogs />
      </div>
    </div>
  );
};

export default Analysis;
