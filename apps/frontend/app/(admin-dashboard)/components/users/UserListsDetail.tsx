"use client";
import { useEffect, useState } from "react";
import { adminUsersService } from "@/services/admin/users";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Mail, Phone, Pin } from "lucide-react";
let data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
    day: "Mon",
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
    day: "Tue",
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
    day: "Wed",
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
    day: "Thu",
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
    day: "Fri",
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
    day: "Sat",
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
    day: "Sun",
  },
];
const UsersLeft = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    adminUsersService.getAllUsers().then((data: any) => {
      setUsers(data.users || []);
    });
  }, []);

  return (
    <div className="w-64  bg-white h-full overflow-y-auto">
      <section className="p-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
        <h1 className="text-xl font-bold text-black">Contacts</h1>
        <input
          type="text"
          placeholder="Search"
          className="w-full px-4 py-2 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </section>
      <div className="flex flex-col gap-2 p-2">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelect(user.id)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 hover:bg-neutral-200 bg-neutral-100 rounded-2xl transition-colors group"
          >
            <img
              src={
                user.image ||
                "https://www.liberal.org.au/wp-content/uploads/2024/09/Untitled_design__3_-removebg-preview-5.png"
              }
              alt={user.name || ""}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h1 className="text-black font-medium group-hover:text-indigo-400 transition-colors">
                {user.name || "No Name"}
              </h1>
              <p className="text-sm text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserDetailRight = ({ userId }: { userId: string | null }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      adminUsersService
        .getUserById(userId)
        .then((data: any) => {
          setUser(data);
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
    }
  }, [userId]);

  if (!userId) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500 h-full">
        <p>Select a user to view details</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500 h-full">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 bg-neutral-200 text-white h-full overflow-y-auto">
      <div className="p-2">
        <section className="pl-4 flex items-center gap-6">
          <div className="w-50 h-50 flex items-center justify-center overflow-hidden">
            <img
              src={
                user.image ||
                "https://www.liberal.org.au/wp-content/uploads/2024/09/Untitled_design__3_-removebg-preview-5.png"
              }
              alt={user.name || ""}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl text-black font-bold uppercase mb-1">
              {user.name}
            </h1>
            <div className="text-neutral-400 flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                {user.emailVerified && (
                  <span className="rounded-full bg-green-500/10 text-green-500 text-xs border border-green-500/20">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2">
                  <Phone size={12} />
                  <span className="text-sm">+66-81-234-5678</span>
                </span>
                <span className="flex items-center gap-2">
                  <Pin size={12} />
                  <span className="text-sm">123 Main St, Anytown, USA</span>
                </span>
              </div>
              <div className="flex flex-row items-center gap-2">
                <span>
                  <Mail size={12} />
                </span>
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white p-4 rounded-2xl border overflow-hidden">
          <div className="col-span-2">
            <span className="text-2xl text-neutral-900 font-bold block mb-1">
              Properties
            </span>
            {user.properties.length > 0 ? (
              <div className="flex flex-row gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {user.properties.map((property: any) => (
                  <div
                    key={property.id}
                    className="w-[350px] relative shrink-0 rounded-xl overflow-hidden"
                  >
                    <img
                      src={
                        // ถ้าเป็น Array และมีสมาชิก -> เอาตัวแรก
                        Array.isArray(property.images) &&
                        property.images.length > 0
                          ? property.images[0]
                          : typeof property.images === "string" &&
                              property.images.startsWith("[") // ถ้าเป็น string JSON
                            ? JSON.parse(property.images)[0]
                            : "https://placehold.co/600x400?text=No+Image" // Fallback
                      }
                      alt={property.title || "Property Image"}
                      className="w-full h-44 object-cover"
                    />
                    <span className="absolute top-2 right-2 p-2 cursor-pointer bg-neutral-200 rounded-full">
                      <ArrowUpRight />
                    </span>
                    <div className="space-y-1 p-2 bg-neutral-100">
                      <h1 className="text-sm font-medium text-neutral-900 truncate">
                        {property.title}
                      </h1>
                      <p className="text-xs text-neutral-400 line-clamp-2">
                        {property.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-md text-neutral-500 font-mono  flex-1">
                          ฿{Number(property.price).toLocaleString()}
                          <span className="text-neutral-400 text-[10px]">
                            /month
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-black w-full h-64 flex items-center justify-center">
                No properties found
              </div>
            )}
          </div>
        </div>
        <section className="grid grid-cols-2 gap-2">
          <ActiveChart />
          <UserPropertyChart />
        </section>
      </div>
    </div>
  );
};

const UserPropertyChart = () => {
  return (
    <div className="rounded-2xl bg-white p-2 mt-2">
      <span className="text-2xl text-neutral-900 font-bold block mb-1">
        Properties
      </span>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart data={data}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis width={0} height={0} />
          <YAxis width={0} height={0} />
          <Tooltip />
          <Pie
            type="monotone"
            dataKey="uv"
            stroke="#8884d8"
            fillOpacity={1}
            fill="#1F51FF"
            innerRadius="80%"
            outerRadius="100%"
            cornerRadius="50%"
            paddingAngle={5}
            isAnimationActive={true}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const CustomCursor = (props: any) => {
  const { x, width, height } = props;
  const centerX = x + width / 2;
  return (
    <line
      x1={centerX}
      x2={centerX}
      y1={0}
      y2={height}
      stroke="#52525B"
      strokeWidth={1}
      strokeDasharray="5 5"
    />
  );
};

const ActiveChart = () => {
  return (
    <div className="rounded-2xl bg-white p-2 mt-2">
      <span className="text-2xl text-neutral-900 font-bold block mb-1">
        Active
      </span>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            width={0}
            height={0}
            dataKey="name"
            domain={["dataMin", "dataMax"]}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={0}
            height={0}
            tick={false}
            axisLine={false}
            tickLine={false}
          />
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            vertical={false}
          />
          <Tooltip
            cursor={<CustomCursor />}
            content={(props: any) => {
              const { active, payload, label } = props;
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 rounded-xl border border-neutral-200 shadow-sm">
                    <p className="text-sm text-neutral-900 font-medium">
                      {label}
                    </p>
                    <p className="text-sm text-neutral-500 font-mono">
                      {payload[0].value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Bar
            type="monotone"
            dataKey="uv"
            fillOpacity={1}
            fill="#1F51FF"
            radius={[20, 20, 20, 20]}
            background={{
              fill: "#E5E4E2",
              radius: 20,
            }}
          >
            <LabelList
              dataKey="uv"
              position="inside"
              fill="#fff"
              fontSize={12}
            />
            <LabelList
              dataKey="day"
              position="bottom"
              fill="#666"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const UserListsDetail = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <div className="flex h-full bg-white overflow-hidden">
      <UsersLeft onSelect={setSelectedUserId} />
      <UserDetailRight userId={selectedUserId} />
    </div>
  );
};

export default UserListsDetail;
