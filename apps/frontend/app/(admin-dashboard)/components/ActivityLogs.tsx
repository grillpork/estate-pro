"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  MoreHorizontal,
  User2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { adminLogsService } from "@/services/admin/logs";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ActivityItem = ({ item }: { item: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isApproved = item.action === "approve" || item.action === "create";
  const isRejected = item.action === "reject" || item.action === "ban";
  const date = new Date(item.createdAt);

  return (
    <div className="relative flex gap-4 group">
      {/* Timeline Dot */}
      <div
        className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center border-4 border-[#1A1A1E] shrink-0 transition-colors ${
          isApproved
            ? "bg-green-500 text-white"
            : isRejected
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
        }`}
      >
        <span
          className={`absolute z-50 -top-1 -right-2 ${
            isApproved
              ? "bg-green-500"
              : isRejected
                ? "bg-red-500"
                : "bg-blue-500"
          } rounded-full p-1`}
        >
          {isApproved ? (
            <CheckCircle2 size={12} />
          ) : isRejected ? (
            <XCircle size={12} />
          ) : (
            <AlertCircle size={12} />
          )}
        </span>

        {item.entityType === "user" ? (
          <User2 size={16} />
        ) : (
          <Building2 size={16} />
        )}
      </div>

      <div className="flex-1 pt-1 pb-4 border-b border-[#27272A] last:border-0 group-last:pb-0">
        <div
          className="flex items-center justify-between mb-1 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                isApproved
                  ? "bg-green-500/10 text-green-400"
                  : isRejected
                    ? "bg-red-500/10 text-red-400"
                    : "bg-blue-500/10 text-blue-400"
              }`}
            >
              {item.action}
            </span>
            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
              <Calendar size={10} />
              {date.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={`text-neutral-500 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        <p
          className="text-sm font-medium text-white mb-0.5 cursor-pointer hover:text-indigo-400 transition-colors capitalize"
          onClick={() => setIsOpen(!isOpen)}
        >
          {item.entityType} {item.action}
        </p>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-2">
                <p className="text-xs text-neutral-400 break-all">
                  ID: {item.entityId}
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 p-1 px-2 rounded-md bg-[#27272A] w-fit">
                    <div className="w-4 h-4 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] text-white uppercase">
                      {(item.actor?.name || "?").charAt(0)}
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      by {item.actor?.name || "Unknown"}
                    </span>
                  </div>
                </div>

                {item.details?.reason && (
                  <p className="text-xs text-red-300 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    Note: {item.details.reason}
                  </p>
                )}
                {item.details?.newStatus && (
                  <p className="text-xs text-neutral-500">
                    Status: {item.details.oldStatus} → {item.details.newStatus}
                  </p>
                )}
                <div className="h-2"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <p className="text-xs text-neutral-500 truncate mt-1">
            by {item.actor?.name || "Unknown"} •{" "}
            {date.toLocaleDateString("th-TH")}
          </p>
        )}
      </div>
    </div>
  );
};
const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const fetchLogs = async () => {
      const logs = await adminLogsService.getAllLogs();
      setLogs(logs);
    };
    fetchLogs();
  }, []);
  return (
    <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Activity Feed</h3>
        <button className="text-neutral-400 hover:text-white hover:bg-[#27272A] rounded-lg transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <ScrollArea className="flex-1 w-full pr-4">
        <div className="space-y-2">
          {logs.map((item: any) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ActivityLogs;
