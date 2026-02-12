"use client";
import React, { useEffect, useState } from "react";
import { adminPropertiesService } from "@/services/admin/properties";
import { adminUsersService } from "@/services/admin/users";
import { Building2, TrendingDown, TrendingUp, User2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import NumberFlow from "@number-flow/react";
const data = [
  { name: "Jan", uv: 4000, pv: 2400, amt: 2400 },
  { name: "Feb", uv: 3000, pv: 1398, amt: 2210 },
  { name: "Mar", uv: 2000, pv: 9800, amt: 2290 },
  { name: "Apr", uv: 2780, pv: 3908, amt: 2000 },
  { name: "May", uv: 1890, pv: 4800, amt: 2181 },
  { name: "Jun", uv: 2390, pv: 3800, amt: 2500 },
  { name: "Jul", uv: 3490, pv: 4300, amt: 2100 },
];

const Analysis = () => {
  const [usersCount, setUsersCount] = useState<number>(0);
  const [propertiesCount, setPropertiesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, propertiesData] = await Promise.all([
          adminUsersService.getAllUsers(),
          adminPropertiesService.getAllProperties(),
        ]);

        // getAllUsers อาจ return object ที่มี pagination
        if (Array.isArray(usersData)) {
          setUsersCount(usersData.length);
        } else {
          setUsersCount(
            usersData.pagination?.total || usersData.users?.length || 0,
          );
        }

        setPropertiesCount(propertiesData.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-white">
        <section className="grid grid-cols- gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-neutral-900 p-4 rounded-xl animate-pulse"
            >
              <div className="h-4 bg-neutral-700 rounded w-24 mb-2" />
              <div className="h-8 bg-neutral-700 rounded w-12" />
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="text-white flex-1 flex flex-col">
      <section className="grid grid-cols-3 gap-4">
        <div className="bg-white flex items-center gap-2 p-2 rounded-2xl">
          <div className="p-4 bg-amber-600 rounded-2xl">
            <User2 size={32} />
          </div>
          <div>
            <div className="text-neutral-400 text-sm flex items-center gap-2">
              <p>จำนวนผู้ใช้ทั้งหมด</p>
              <p className="text-green-500 text-xs">+{usersCount - 2}%</p>
            </div>
            <p className="text-2xl text-black font-bold">{usersCount}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 flex-1 mt-4">
        {/* Left Column - Chart + Report */}
        <div className="flex flex-col gap-4 h-full">
          <ResponsiveContainer
            width="100%"
            height={300}
            className="recharts-wrapper shrink-0"
          >
            <AreaChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              className="bg-white text-black rounded-xl"
            >
              <YAxis
                stroke="rgba(0,0,0,0)"
                tick={{ fill: "rgba(0,0,0,1)", fontSize: 10 }}
                tickFormatter={(value) => `${value}`}
              />
              <XAxis
                dataKey="name"
                stroke="rgba(0,0,0,0)"
                strokeWidth={2}
                tick={{ fill: "rgba(0,0,0,1)", fontSize: 10 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: "rgba(0,0,0,0.5)",
                  stroke: "rgba(255,255,255,0.5)",
                  strokeWidth: 2,
                  strokeDasharray: "3 3",
                  radius: 12,
                  fillOpacity: 0.1,
                }}
              />
              <Area
                type="monotone"
                dataKey="pv"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Report - ขยายเต็มพื้นที่เหลือ */}
          <div className="bg-neutral-800 rounded-xl border p-4 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-neutral-400 text-sm">รายงาน</p>
              <p className="text-neutral-400 text-sm cursor-pointer hover:text-white">
                ดูทั้งหมด
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - History */}
        <div className="bg-neutral-800 rounded-xl border p-4 h-full">
          <div className="flex items-center justify-between">
            <p className="text-neutral-400 text-sm">ประวัติการอนุมัติ</p>
            <p className="text-neutral-400 text-sm cursor-pointer hover:text-white">
              ดูทั้งหมด
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-800 rounded-xl border px-4 py-1">
        <p className="text-neutral-400 text-sm">
          {payload[0].dataKey === "pv" ? "จำนวนผู้ใช้" : "จำนวนทรัพย์สิน"}
          {label}
        </p>
        <div className="flex items-center gap-2">
          {payload[0].dataKey === "uv" ? (
            <TrendingUp className="text-green-500" />
          ) : (
            <TrendingDown className="text-red-500" />
          )}
          <NumberFlow value={payload[0].value} className="text-white" />
        </div>
      </div>
    );
  }
  return null;
};

export default Analysis;
