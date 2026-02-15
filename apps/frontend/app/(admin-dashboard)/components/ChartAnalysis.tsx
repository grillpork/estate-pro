"use client";
import { Activity } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { adminUsersService } from "@/services/admin/users";
import { adminPropertiesService } from "@/services/admin/properties";
import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#151517]/90 backdrop-blur-md border border-[#27272A] p-3 rounded-xl shadow-xl">
        <p className="text-neutral-300 text-xs font-medium mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>
            <span className="text-xs text-neutral-400">Users:</span>
            <span className="text-sm font-bold text-white font-mono">
              <NumberFlow value={payload[1]?.value} />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]"></div>
            <span className="text-xs text-neutral-400">Properties:</span>
            <span className="text-sm font-bold text-white font-mono">
              <NumberFlow value={payload[0]?.value} />
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ChartAnalysis = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);

  //จำนวนผุ้ใช้และจำนวนทรัพย์สิน
  useEffect(() => {
    adminUsersService.getAllUsers(1, 1000).then((res: any) => {
      setUsers(res.users || []); // แก้ตรงนี้: res.users เพราะ Controller ส่งมาเป็น { users, pagination }
    });
    adminPropertiesService.getAllProperties().then((res: any) => {
      setProperties(res || []);
    });
  }, []);

  // Process data for chart (Daily)
  const data = (() => {
    const groupedData: Record<
      string,
      { name: string; Property: number; User: number; dateVal: number }
    > = {};

    const process = (items: any[], key: "Property" | "User") => {
      if (!Array.isArray(items)) return;
      items.forEach((item) => {
        if (!item.createdAt) return;
        const d = new Date(item.createdAt);
        const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
        const label = d.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        });

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {
            name: label,
            Property: 0,
            User: 0,
            dateVal: d.getTime(),
          };
        }
        groupedData[dateKey][key] += 1;
      });
    };

    process(properties, "Property"); // Sent as 'uv' to chart
    process(users, "User"); // Sent as 'pv' to chart

    // Sort by date
    return Object.values(groupedData)
      .sort((a, b) => a.dateVal - b.dateVal)
      .map(({ name, Property, User }) => ({
        name,
        property: Property,
        user: User,
      }));
  })();
  return (
    <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Activity size={18} />
          </div>
          <h3 className="text-white font-semibold text-lg">
            User & Property Analytics
          </h3>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272A"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#52525B"
              tick={{ fill: "#71717A", fontSize: 11 }}
              axisLine={false}
              tickLine={true}
              tickMargin={10}
            />
            <YAxis
              stroke="#52525B"
              tick={{ fill: "#71717A", fontSize: 11 }}
              tickLine={true}
              axisLine={false}
              tickMargin={10}
              dx={-10}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#52525B",
                strokeWidth: 1,
                strokeDasharray: "5 5",
              }}
            />
            <Area
              type="monotone"
              dataKey="property"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPv)"
            />
            <Area
              type="monotone"
              dataKey="user"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUv)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartAnalysis;
