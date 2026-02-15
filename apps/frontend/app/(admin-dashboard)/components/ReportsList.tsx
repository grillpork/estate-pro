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

// Mock Data (Replace with API call later)
const initialReports = [
  {
    id: 1,
    title: "Inappropriate Content",
    description:
      "This property list contains offensive language in the description.",
    status: "pending",
    date: "2024-02-14",
    reporter: { name: "John Doe", email: "john@example.com", image: "" },
    target: "Property #1234",
  },
  {
    id: 2,
    title: "Scam Alert",
    description:
      "The owner is asking for payment outside the platform. Please investigate immediately.",
    status: "resolved",
    date: "2024-02-13",
    reporter: { name: "Alice Smith", email: "alice@example.com", image: "" },
    target: "User #5678",
  },
  {
    id: 3,
    title: "Duplicate Listing",
    description:
      "This property is listed multiple times with different prices.",
    status: "dismissed",
    date: "2024-02-12",
    reporter: { name: "Bob Johnson", email: "bob@example.com", image: "" },
    target: "Property #9012",
  },
  {
    id: 4,
    title: "Fake Photos",
    description: "The photos used in this listing are from a stock image site.",
    status: "pending",
    date: "2024-02-14",
    reporter: { name: "Sarah Wilson", email: "sarah@example.com", image: "" },
    target: "Property #3456",
  },
  {
    id: 5,
    title: "Harassment",
    description: "User sent abusive messages in the chat.",
    status: "pending",
    date: "2024-02-11",
    reporter: { name: "Mike Brown", email: "mike@example.com", image: "" },
    target: "User #7890",
  },
  {
    id: 6,
    title: "Harassment",
    description: "User sent abusive messages in the chat.",
    status: "pending",
    date: "2024-02-11",
    reporter: { name: "Mike Brown", email: "mike@example.com", image: "" },
    target: "User #7890",
  },
  {
    id: 7,
    title: "Harassment",
    description: "User sent abusive messages in the chat.",
    status: "pending",
    date: "2024-02-11",
    reporter: { name: "Mike Brown", email: "mike@example.com", image: "" },
    target: "User #7890",
  },
  {
    id: 8,
    title: "Harassment",
    description: "User sent abusive messages in the chat.",
    status: "pending",
    date: "2024-02-11",
    reporter: { name: "Mike Brown", email: "mike@example.com", image: "" },
    target: "User #7890",
  },
];

const filterStatusOptions = [
  { id: 0, name: "all", label: "All Status" },
  { id: 1, name: "pending", label: "Pending" },
  { id: 2, name: "resolved", label: "Resolved" },
  { id: 3, name: "dismissed", label: "Dismissed" },
];

const ReportsList = () => {
  const [reports, setReports] = useState(initialReports);
  const [filteredReports, setFilteredReports] = useState(initialReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const handleOpen = (id: number) => {
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

    // Filter by Date
    if (filterDate) {
      result = result.filter((r) => r.date === filterDate);
    }

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerTerm) ||
          r.description.toLowerCase().includes(lowerTerm) ||
          r.reporter.name.toLowerCase().includes(lowerTerm),
      );
    }

    setFilteredReports(result);
  }, [reports, filterStatus, searchTerm, filterDate]);

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

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
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
                    <h3 className="text-base font-semibold text-white truncate">
                      {report.title}
                    </h3>
                  </div>

                  <p className="text-neutral-400 text-sm mb-2 line-clamp-1">
                    {report.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        {report.reporter.image ? (
                          <img
                            src={report.reporter.image}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User size={10} />
                        )}
                      </div>
                      <span className="text-neutral-300">
                        {report.reporter.name}
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
                      {new Date(report.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
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
                      <p className="text-neutral-400 p-2 rounded-lg border border-[#27272A] bg-[#202024]">{report.title}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-300 mb-1">
                        Description
                      </h3>
                      <p className="text-neutral-400 h-64 p-2 rounded-lg border border-[#27272A] bg-[#202024] ">{report.description}</p>
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
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                          {report.reporter.image ? (
                            <img
                              src={report.reporter.image}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={18} />
                          )}
                        </div>
                        <span className="flex flex-col text-sm text-neutral-400">
                            <p className="text-white">{report.reporter.name}</p>
                            <p className="text-neutral-500 text-xs">{report.reporter.email}</p>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReportId(null)}
                    className="mt-6 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    Close
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
