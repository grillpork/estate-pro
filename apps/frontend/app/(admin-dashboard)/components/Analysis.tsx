"use client";
import { useEffect, useState } from "react";
import { adminPropertiesService } from "@/services/admin/properties";
import { adminUsersService } from "@/services/admin/users";
import {
  Building2,
  User2,
  AlertCircle,
  Lightbulb,
  Zap,
  ArrowRight,
} from "lucide-react";
import ChartAnalysis from "./ChartAnalysis";
import ActivityLogs from "./ActivityLogs";
import StatCard from "./StatCard";

const mockReports = [
  {
    id: 1,
    title: "Slow Performance",
    description: "Dashboard loading time is too high in peak hours.",
    user: "johndoe@gmail.com",
    createdAt: "2024-01-01",
    type: "performance",
  },
  {
    id: 2,
    title: "Login Error 500",
    description: "Cannot login via Google OAuth.",
    user: "jane_smith@gmail.com",
    createdAt: "2024-02-12",
    type: "bug",
  },
  {
    id: 3,
    title: "Feature Request: Dark Mode",
    description: "Users are asking for a dedicated dark mode toggle.",
    user: "dev_master@gmail.com",
    createdAt: "2024-02-10",
    type: "feature",
  },
];

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
        <div className="flex items-center gap-2 bg-[#1A1A1E] p-1 rounded-xl border border-[#27272A]">
          {/* Keep existing buttons */}
          <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#27272A] text-white shadow-sm">
            7 Days
          </button>
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
          <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">
                System Reports
              </h3>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors">
                View All <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-3">
              {mockReports.map((report) => (
                <div
                  key={report.id}
                  className="group flex items-center justify-between p-4 rounded-xl bg-[#202024] hover:bg-[#27272A] border border-transparent hover:border-[#3F3F46] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2.5 rounded-lg ${
                        report.type === "bug"
                          ? "bg-red-500/10 text-red-500"
                          : report.type === "feature"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-orange-500/10 text-orange-500"
                      }`}
                    >
                      {report.type === "bug" ? (
                        <AlertCircle size={18} />
                      ) : report.type === "feature" ? (
                        <Lightbulb size={18} />
                      ) : (
                        <Zap size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                        {report.title}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {report.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {report.createdAt}
                    </span>
                    <div className="flex -space-x-1.5">
                      <div className="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center text-[9px] text-white border border-[#1A1A1E]">
                        {report.user.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Approval History (1/3 width) */}
        <ActivityLogs />
      </div>
    </div>
  );
};

export default Analysis;
