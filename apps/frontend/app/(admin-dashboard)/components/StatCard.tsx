"use client";
import NumberFlow from "@number-flow/react";

const StatCard = ({
  title,
  count,
  icon: Icon,
  colorClass,
  trend,
  trendUp,
  subLabel = "vs last month",
}: any) => (
  <div className="bg-[#1A1A1E] border relative overflow-hidden border-[#27272A] p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all shadow-sm">
    <div className="flex flex-col gap-1">
      <p className="text-neutral-400 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-white tracking-tight">
        <NumberFlow value={count} />
      </p>
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            trend === "Action Needed"
              ? "bg-orange-500/10 text-orange-400"
              : trendUp
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
          }`}
        >
          {trend}
        </span>
        <span className="text-xs text-neutral-500">{subLabel}</span>
      </div>
    </div>
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}
    >
      <Icon size={200} className="absolute top-0 right-0 opacity-50" />
    </div>
  </div>
);

export default StatCard;
