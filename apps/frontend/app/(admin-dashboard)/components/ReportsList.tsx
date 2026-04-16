"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Filter,
  Calendar,
  MoreHorizontal,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllReports, updateReportStatus } from "@/services/admin/report";
import { toast } from "react-hot-toast";

const filterStatusOptions = [
  { id: 0, name: "all", label: "All Status" },
  { id: 1, name: "pending", label: "Pending" },
  { id: 2, name: "resolved", label: "Resolved" },
  { id: 3, name: "dismissed", label: "Dismissed" },
];

const filterTypeOptions = [
  { id: 0, name: "all", label: "All Types" },
  { id: 1, name: "website", label: "Website Issue" },
  { id: 2, name: "seller", label: "Seller Issue" },
  { id: 3, name: "buyer", label: "Buyer Issue" },
  { id: 4, name: "other", label: "Other" },
];

const ReportsList = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterTypeDropdownOpen, setFilterTypeDropdownOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllReports();
        // Map API data to UI structure
        const mappedData = data.map((item: any) => ({
          ...item,
          status: item.status || "pending", // Default to pending if missing
          target: item.target || "System", // Default target
          date: item.createdAt,
          reporter: item.user,
        }));
        setReports(mappedData);
        setFilteredReports(mappedData);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };
    fetchData();
  }, []);

  const handleOpen = (id: string) => {
    setSelectedReportId(id);
  };

  // Filter and Search Logic
  useEffect(() => {
    let result = reports;

    // Filter by Status
    if (filterStatus !== "all") {
      result = result.filter(
        (r) => r.status.toLowerCase() === filterStatus.toLowerCase(),
      );
    }

    // Filter by Date (Simple string match for now, ideally compare Date objects)
    if (filterDate) {
      result = result.filter((r) => r.date.startsWith(filterDate));
    }

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerTerm) ||
          r.description.toLowerCase().includes(lowerTerm) ||
          r.reporter?.name?.toLowerCase().includes(lowerTerm) ||
          r.reporter?.email?.toLowerCase().includes(lowerTerm),
      );
    }

    // Filter by Type
    if (filterType !== "all") {
      if (filterType === "other") {
        result = result.filter(r => r.type && r.type.startsWith("อื่นๆ:"));
      } else {
        result = result.filter((r) => r.type?.toLowerCase() === filterType.toLowerCase());
      }
    }

     setFilteredReports(result);
   }, [reports, filterStatus, filterType, searchTerm, filterDate]);
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateReportStatus(parseInt(id), newStatus);
      toast.success(`อัปเดตสถานะเป็น ${newStatus} เรียบร้อย`);
      // Update local state
      setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "resolved":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "dismissed":
        return "text-neutral-400 bg-neutral-500/10 border-neutral-500/20";
      default:
        return "text-neutral-400 bg-neutral-500/10 border-neutral-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle size={14} />;
      case "resolved":
        return <CheckCircle2 size={14} />;
      case "dismissed":
        return <XCircle size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const getTypeDisplay = (type: string) => {
    if (!type) return "Unknown";
    if (type.startsWith("อื่นๆ:")) return type.replace("อื่นๆ:", "Other:");
    const option = filterTypeOptions.find(o => o.name === type);
    return option ? option.label : type;
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0F0F12] overflow-hidden p-6 gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
            Reports & Issues
          </h1>
          <p className="text-neutral-400 text-sm">
            Review and manage user reports and flagged content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-[#1A1A1E] text-neutral-300 pl-10 pr-4 py-2.5 rounded-xl border border-[#27272A] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600 text-sm"
            />
          </div>

          {/* Date Filter */}
          <div className="relative group">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none"
              size={16}
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-[#1A1A1E] text-neutral-300 pl-10 pr-4 py-2.5 rounded-xl border border-[#27272A] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm w-full md:w-auto appearance-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>

          {/* Type Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setFilterTypeDropdownOpen(!filterTypeDropdownOpen);
                setFilterDropdownOpen(false);
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-sm font-medium ${
                filterTypeDropdownOpen
                  ? "bg-[#1A1A1E] border-orange-500/50 text-white"
                  : "bg-[#1A1A1E] border-[#27272A] text-neutral-400 hover:text-white"
              }`}
            >
              <Filter size={16} />
              <span className="hidden md:inline">
                {filterTypeOptions.find((s) => s.name === filterType)
                  ?.label || "Type"}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  filterTypeDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {filterTypeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1E] border border-[#27272A] rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden"
                >
                  <div className="p-1">
                    {filterTypeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setFilterType(option.name);
                          setFilterTypeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          filterType === option.name
                            ? "bg-orange-600/10 text-orange-400 font-medium"
                            : "text-neutral-400 hover:bg-[#27272A] hover:text-white"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            filterType === option.name
                              ? "bg-orange-500"
                              : "bg-neutral-600"
                          }`}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                 setFilterDropdownOpen(!filterDropdownOpen);
                 setFilterTypeDropdownOpen(false);
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-sm font-medium ${
                filterDropdownOpen
                  ? "bg-[#1A1A1E] border-indigo-500/50 text-white"
                  : "bg-[#1A1A1E] border-[#27272A] text-neutral-400 hover:text-white"
              }`}
            >
              <Filter size={16} />
              <span className="hidden md:inline">
                {filterStatusOptions.find((s) => s.name === filterStatus)
                  ?.label || "Filter"}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  filterDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {filterDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1E] border border-[#27272A] rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden"
                >
                  <div className="p-1">
                    {filterStatusOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setFilterStatus(option.name);
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          filterStatus === option.name
                            ? "bg-indigo-600/10 text-indigo-400 font-medium"
                            : "text-neutral-400 hover:bg-[#27272A] hover:text-white"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            filterStatus === option.name
                              ? "bg-indigo-500"
                              : "bg-neutral-600"
                          }`}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto custom-scrollbar">
        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
            <FileText
              size={48}
              strokeWidth={1.5}
              className="mb-4 text-neutral-600"
            />
            <p>No reports found matching your criteria.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => handleOpen(report.id)}
                className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl p-4 hover:border-neutral-600 transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-medium uppercase tracking-wide ${getStatusColor(report.status)}`}
                    >
                      {getStatusIcon(report.status)}
                      {report.status}
                    </div>
                    <h3 className="text-base font-semibold text-white truncate flex items-center gap-2">
                       {report.title}
                       <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold uppercase tracking-wider shrink-0">
                          {getTypeDisplay(report.type)}
                       </span>
                    </h3>
                  </div>

                  <p className="text-neutral-400 text-sm mb-2 line-clamp-1">
                    {report.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 overflow-hidden">
                          <img
                            src={report.reporter?.image || "/images/userIcon.png"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/userIcon.png";
                            }}
                          />
                      </div>
                      <span className="text-neutral-300">
                        {report.reporter?.name ||
                          report.reporter?.email ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-neutral-700"></div>
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-400">Target:</span>
                      <span className="text-neutral-300">{report.target}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-neutral-700"></div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(report.date).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                  <button className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#202024] text-xs font-medium text-neutral-300 hover:text-white hover:bg-[#27272A] transition-colors">
                    View Details
                  </button>
                  <button className="text-neutral-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#27272A]">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Details */}
        <div className="flex w-full">
          {selectedReportId ? (
            (() => {
              const report = filteredReports.find(
                (r) => r.id === selectedReportId,
              );
              if (!report) return null;
              return (
                <div className="bg-[#1A1A1E] w-full rounded-xl border border-[#27272A] p-4 shadow-2xl h-fit sticky top-0">
                  <h2 className="text-white text-lg font-bold mb-4">
                    Report Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-300 mb-1">
                        Title
                      </h3>
                      <div className="flex flex-col gap-2 p-3 rounded-lg border border-[#27272A] bg-[#202024]">
                         <p className="text-white font-medium">{report.title}</p>
                         <span className="w-fit text-[10px] px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold uppercase tracking-wider">
                           {getTypeDisplay(report.type)}
                         </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-300 mb-1">
                        Description
                      </h3>
                      <p className="text-neutral-400 h-64 p-2 rounded-lg border border-[#27272A] bg-[#202024] ">
                        {report.description}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-300 mb-1">
                        Status
                      </h3>
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-medium uppercase tracking-wide ${getStatusColor(report.status)}`}
                      >
                        {getStatusIcon(report.status)}
                        {report.status}
                      </div>
                      <div className="flex items-center mt-4 gap-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 overflow-hidden shrink-0">
                            <img
                              src={report.reporter?.image || "/images/userIcon.png"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/userIcon.png";
                              }}
                            />
                        </div>
                        <span className="flex flex-col text-sm text-neutral-400">
                          <p className="text-white">
                            {report.reporter?.name || "Unknown"}
                          </p>
                          <p className="text-neutral-500 text-xs">
                            {report.reporter?.email || ""}
                          </p>
                        </span>
                      </div>
                    </div>
                  </div>
                   <div className="flex gap-3 mt-8">
                     <button
                       onClick={() => handleUpdateStatus(report.id, "resolved")}
                       className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                     >
                       <CheckCircle2 size={18} />
                       Resolve Issue
                     </button>
                     <button
                       onClick={() => handleUpdateStatus(report.id, "dismissed")}
                       className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-colors font-bold text-sm border border-white/5"
                     >
                       Dismiss
                     </button>
                  </div>

                  <button
                    onClick={() => setSelectedReportId(null)}
                    className="mt-4 w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 rounded-lg transition-colors font-medium text-xs"
                  >
                    Close Panel
                  </button>
                 </div>
               );
             })()

          ) : (
            <div className="flex items-center justify-center w-full h-64 border border-[#27272A] rounded-xl bg-[#1A1A1E] text-neutral-500">
              <p>เลือกรายการเพื่อดูรายละเอียด</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-[#27272A] flex justify-between items-center text-[10px] text-neutral-600 uppercase tracking-widest font-medium z-10 w-full">
        <p>Total: {filteredReports.length} Reports</p>
      </div>
    </div>
  );
};

export default ReportsList;
