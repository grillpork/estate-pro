"use client";
import { useEffect, useState } from "react";
import { adminPropertiesService } from "@/services/admin/properties";
import {
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Filter,
  Check,
  X,
  MapPin,
  Calendar,
  Home,
  Building2,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Property = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  status: string;
  type?: string;
  Owner: {
    name: string;
    email?: string;
    image?: string;
  };
  amenities: string[];
  createdAt: string;
  location?: string;
};

const filterStatusOptions = [
  { id: 0, name: "all", label: "สถานะทั้งหมด" },
  { id: 1, name: "pending", label: "รอการอนุมัติ" },
  { id: 2, name: "approved", label: "อนุมัติแล้ว" },
  { id: 3, name: "rejected", label: "ไม่อนุมัติ" },
];

const PropertyLists = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [statusConfirmation, setStatusConfirmation] = useState<{
    isOpen: boolean;
    propertyId: string | null;
    status: "approved" | "rejected" | null;
    reason: string;
  }>({ isOpen: false, propertyId: null, status: null, reason: "" });

  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    propertyId: string | null;
  }>({ isOpen: false, propertyId: null });

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      let data = await adminPropertiesService.getAllProperties();
      if (!Array.isArray(data)) data = [];
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Filter and Search Logic
  useEffect(() => {
    let result = properties;

    // Filter by Status
    if (filterStatus === "all") {
      // Show only approved and rejected in the main list
      result = result.filter((p) => p.status !== "pending");
    } else {
      // Show specific status (e.g., pending)
      result = result.filter(
        (p) => p.status?.toLowerCase() === filterStatus.toLowerCase(),
      );
    }

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(lowerTerm) ||
          p.description?.toLowerCase().includes(lowerTerm) ||
          p.Owner?.name?.toLowerCase().includes(lowerTerm),
      );
    }

    setFilteredProperties(result);
    setCurrentPage(1);
  }, [properties, filterStatus, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDelete = (id: string) => {
    setDeleteConfirmation({ isOpen: true, propertyId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.propertyId) return;
    try {
      await adminPropertiesService.deleteProperty(
        deleteConfirmation.propertyId,
      );
      setProperties((prev) =>
        prev.filter((p) => p.id !== deleteConfirmation.propertyId),
      );
    } catch (error) {
      console.error("Error deleting property:", error);
    } finally {
      setDeleteConfirmation({ isOpen: false, propertyId: null });
    }
  };

  const handleUpdateStatus = (id: string, status: string) => {
    // Cast string back to union type safely if logic guarantees it, or change param type
    const safeStatus = status as "approved" | "rejected";
    setStatusConfirmation({
      isOpen: true,
      propertyId: id,
      status: safeStatus,
      reason: "",
    });
  };

  const confirmStatusUpdate = async () => {
    if (!statusConfirmation.propertyId || !statusConfirmation.status) return;

    try {
      await adminPropertiesService.updatePropertyStatus(
        statusConfirmation.propertyId,
        statusConfirmation.status,
        statusConfirmation.reason,
      );
      setProperties((prev) =>
        prev.map((p) =>
          p.id === statusConfirmation.propertyId
            ? { ...p, status: statusConfirmation.status! }
            : p,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setStatusConfirmation({
        isOpen: false,
        propertyId: null,
        status: null,
        reason: "",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-500 ";
      case "pending":
        return "bg-yellow-500 ";
      case "rejected":
        return "bg-red-500 ";
      default:
        return "bg-neutral-500 ";
    }
  };

  const formatStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "รอการอนุมัติ";
      case "approved":
        return "อนุมัติแล้ว";
      case "rejected":
        return "ไม่อนุมัติ";
      default:
        return status;
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0F0F12] overflow-hidden p-6 gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
              Property Management
            </h1>
            <p className="text-neutral-400 text-sm">
              Manage listings, approvals, and property details.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-[#1A1A1E] p-1 rounded-xl border border-[#27272A]">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setFilterStatus("all");
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "all"
                    ? "bg-[#27272A] text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                รายการอสังหา
              </button>
              <button
                onClick={() => {
                  setActiveTab("pending");
                  setFilterStatus("pending");
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "pending"
                    ? "bg-[#27272A] text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                รายการที่รอตรวจสอบ
                {properties.filter((p) => p.status === "pending").length >
                  0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {properties.filter((p) => p.status === "pending").length}
                  </span>
                )}
              </button>
            </div>

            {/* Search */}
            <div className="relative group w-full md:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 bg-[#1A1A1E] text-neutral-300 pl-10 pr-4 py-2.5 rounded-xl border border-[#27272A] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600 text-sm"
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
                            setCurrentPage(1);
                            if (option.name === "all") setActiveTab("all");
                            else if (option.name === "pending")
                              setActiveTab("pending");
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
      </div>

      {/* Table Container */}
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl overflow-hidden flex-1 flex flex-col shadow-sm relative">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#27272A] bg-[#151517]">
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 w-20 text-center">
                  Image
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  Property
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  Price
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  Owner
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-center">
                  Date
                </th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-neutral-500">
                    Loading...
                  </td>
                </tr>
              ) : paginatedProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <Home
                        size={40}
                        strokeWidth={1.5}
                        className="text-neutral-600 mb-2"
                      />
                      <p>No properties found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProperties.map((property) => (
                  <tr
                    key={property.id}
                    className="group hover:bg-[#202024] transition-colors"
                  >
                    {/* Image */}
                    <td className="px-6 py-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-neutral-800 border border-[#27272A]">
                        <img
                          src={
                            property.image ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcd5J_YDIyLfeZCHcsBpcuN8irwbIJ_VDl0Q&s"
                          }
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Property Info */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-[200px]">
                        <span
                          className="text-sm font-medium text-neutral-200 truncate group-hover:text-white transition-colors"
                          title={property.title}
                        >
                          {property.title}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                          <MapPin size={10} />
                          <span className="truncate">
                            {property.location || "No location info"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-indigo-400">
                        ${property.price.toLocaleString()}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-white overflow-hidden">
                          {property.Owner?.image ? (
                            <img
                              src={property.Owner.image}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            property.Owner?.name?.charAt(0)
                          )}
                        </div>
                        <span className="text-sm text-neutral-300">
                          {property.Owner?.name}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${getStatusBadgeColor(property.status)}`}
                        ></span>
                        <span className="capitalize text-xs text-neutral-300">
                          {formatStatus(property.status)}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                        <Calendar size={12} />
                        {new Date(property.createdAt).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {property.status === "pending" && (
                          <>
                            <button
                              className="p-2 rounded-lg text-neutral-400 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                              onClick={() =>
                                handleUpdateStatus(property.id, "approved")
                              }
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              onClick={() =>
                                handleUpdateStatus(property.id, "rejected")
                              }
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        <button
                          className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          onClick={() => handleDelete(property.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-[#27272A] bg-[#151517] flex items-center justify-between z-10 relative">
          <p className="text-xs text-neutral-500">
            Showing {paginatedProperties.length} of {filteredProperties.length}{" "}
            properties
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-neutral-500 hover:bg-[#27272A] hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setDeleteConfirmation({ isOpen: false, propertyId: null })
              }
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-[#1A1A1E] border border-[#27272A] rounded-2xl shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <Trash2 size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">ยืนยันการลบ?</h3>
                  <p className="text-neutral-400 text-sm">
                    คุณแน่ใจหรือไม่ที่จะลบประกาศนี้?
                    การกระทำนี้ไม่สามารถย้อนกลับได้
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full mt-2">
                  <button
                    onClick={() =>
                      setDeleteConfirmation({ isOpen: false, propertyId: null })
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#27272A] text-neutral-300 hover:bg-[#27272A] hover:text-white transition-colors text-sm font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-medium shadow-lg shadow-red-500/20"
                  >
                    ลบประกาศ
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Status Confirmation Dialog */}
      <AnimatePresence>
        {statusConfirmation.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setStatusConfirmation({ ...statusConfirmation, isOpen: false })
              }
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-[#1A1A1E] border border-[#27272A] rounded-2xl shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    statusConfirmation.status === "approved"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {statusConfirmation.status === "approved" ? (
                    <Check size={24} />
                  ) : (
                    <X size={24} />
                  )}
                </div>
                <div className="space-y-2 w-full">
                  <h3 className="text-xl font-bold text-white">
                    {statusConfirmation.status === "approved"
                      ? "ยืนยันการอนุมัติ?"
                      : "ปฏิเสธการอนุมัติ?"}
                  </h3>
                  <p className="text-neutral-400 text-sm">
                    {statusConfirmation.status === "approved"
                      ? "คุณแน่ใจหรือไม่ที่จะอนุมัติประกาศนี้? ประกาศจะแสดงให้ผู้ใช้ทุกคนเห็น"
                      : "คุณแน่ใจหรือไม่ที่จะปฏิเสธประกาศนี้? กรุณาระบุเหตุผลด้านล่าง"}
                  </p>

                  {statusConfirmation.status === "rejected" && (
                    <textarea
                      value={statusConfirmation.reason}
                      onChange={(e) =>
                        setStatusConfirmation({
                          ...statusConfirmation,
                          reason: e.target.value,
                        })
                      }
                      placeholder="กรุณาระบุเหตุผล..."
                      className="w-full h-24 bg-[#0F0F12] border border-[#27272A] rounded-xl p-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-red-500/50 resize-none mt-2"
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 w-full mt-2">
                  <button
                    onClick={() =>
                      setStatusConfirmation({
                        ...statusConfirmation,
                        isOpen: false,
                      })
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#27272A] text-neutral-300 hover:bg-[#27272A] hover:text-white transition-colors text-sm font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={confirmStatusUpdate}
                    disabled={
                      statusConfirmation.status === "rejected" &&
                      !statusConfirmation.reason.trim()
                    }
                    className={`flex-1 px-4 py-2.5 rounded-xl text-white transition-colors text-sm font-medium shadow-lg ${
                      statusConfirmation.status === "approved"
                        ? "bg-green-500 hover:bg-green-600 shadow-green-500/20"
                        : "bg-red-500 hover:bg-red-600 shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {statusConfirmation.status === "approved"
                      ? "อนุมัติ"
                      : "ปฏิเสธ"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyLists;
