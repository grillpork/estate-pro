"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  Users,
  Crown,
  Calendar,
  RefreshCw,
} from "lucide-react";
import {
  adminUserSubscriptionsService,
  UserSubscription,
  CreateUserSubscriptionPayload,
} from "@/services/admin/userSubscriptions";
import { adminMembershipPlansService, MembershipPlan } from "@/services/admin/membershipPlans";
import { adminUsersService } from "@/services/admin/users";

const STATUS_OPTIONS = ["active", "expired", "cancelled"] as const;
const BILLING_OPTIONS = ["monthly", "yearly"] as const;

const emptyForm: CreateUserSubscriptionPayload = {
  userId: 0,
  planId: 0,
  billingCycle: "monthly",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  status: "active",
  autoRenew: false,
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-400 border border-green-500/20";
    case "expired":
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    case "cancelled":
      return "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20";
    default:
      return "bg-neutral-500/10 text-neutral-400";
  }
};

const UserSubscriptionsList = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<UserSubscription | null>(null);
  const [form, setForm] = useState<CreateUserSubscriptionPayload>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    subId: number | null;
  }>({ isOpen: false, subId: null });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [subs, plansData, usersData] = await Promise.all([
        adminUserSubscriptionsService.getAllSubscriptions(),
        adminMembershipPlansService.getAllPlans(),
        adminUsersService.getAllUsers(1, 999),
      ]);
      setSubscriptions(Array.isArray(subs) ? subs : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
      const userList = usersData?.users ?? (Array.isArray(usersData) ? usersData : []);
      setUsers(userList);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = subscriptions.filter((s) =>
    filterStatus === "all" ? true : s.status === filterStatus
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openCreateModal = () => {
    setEditingSub(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (sub: UserSubscription) => {
    setEditingSub(sub);
    setForm({
      userId: sub.userId,
      planId: sub.planId,
      billingCycle: sub.billingCycle,
      startDate: sub.startDate?.slice(0, 10) ?? "",
      endDate: sub.endDate?.slice(0, 10) ?? "",
      status: sub.status,
      autoRenew: sub.autoRenew,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editingSub) {
        const updated = await adminUserSubscriptionsService.updateSubscription(editingSub.id, form);
        setSubscriptions(subscriptions.map((s) => (s.id === editingSub.id ? updated : s)));
      } else {
        const created = await adminUserSubscriptionsService.createSubscription(form);
        setSubscriptions([created, ...subscriptions]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save subscription:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.subId) return;
    try {
      await adminUserSubscriptionsService.deleteSubscription(deleteConfirm.subId);
      setSubscriptions(subscriptions.filter((s) => s.id !== deleteConfirm.subId));
    } catch (err) {
      console.error("Failed to delete subscription:", err);
    } finally {
      setDeleteConfirm({ isOpen: false, subId: null });
    }
  };

  const getPlanName = (planId: number) =>
    plans.find((p) => p.id === planId)?.name ?? `Plan #${planId}`;

  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  return (
    <div className="w-full flex flex-col h-full bg-[#0F0F12] overflow-hidden p-6 gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
            User Subscriptions
          </h1>
          <p className="text-neutral-400 text-sm">
            {activeCount} active · {subscriptions.length} total subscriptions
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={16} />
          Assign Plan
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl overflow-hidden flex-1 flex flex-col shadow-sm">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#27272A] bg-[#151517]">
          <p className="text-xs text-neutral-500">
            Showing {paginated.length} of {filtered.length} results
          </p>
          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                filterDropdownOpen
                  ? "bg-[#1A1A1E] border-indigo-500/50 text-white"
                  : "bg-[#1A1A1E] border-[#27272A] text-neutral-400 hover:text-white"
              }`}
            >
              <Filter size={13} />
              {filterStatus === "all" ? "All Status" : filterStatus}
              <ChevronDown
                size={12}
                className={`transition-transform ${filterDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {filterDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-44 bg-[#1A1A1E] border border-[#27272A] rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-1">
                    {["all", ...STATUS_OPTIONS].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setFilterStatus(s);
                          setFilterDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                          filterStatus === s
                            ? "bg-indigo-600/10 text-indigo-400 font-medium"
                            : "text-neutral-400 hover:bg-[#27272A] hover:text-white"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            filterStatus === s ? "bg-indigo-500" : "bg-neutral-600"
                          }`}
                        />
                        <span className="capitalize">{s === "all" ? "All Status" : s}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#27272A] bg-[#151517]">
                <th className="px-5 py-3.5 text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  User
                </th>
                <th className="px-5 py-3.5 text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  Plan
                </th>
                <th className="px-5 py-3.5 text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  Billing
                </th>
                <th className="px-5 py-3.5 text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  Period
                </th>
                <th className="px-5 py-3.5 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-center">
                  Auto Renew
                </th>
                <th className="px-5 py-3.5 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-center">
                  Status
                </th>
                <th className="px-5 py-3.5 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-4 bg-[#27272A] rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center">
                    <div className="flex flex-col items-center gap-3 text-neutral-500">
                      <Users size={40} strokeWidth={1.5} className="text-neutral-700" />
                      <p className="text-sm">No subscriptions found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((sub) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-[#202024] transition-colors"
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 text-xs font-bold">
                          {(sub.userName ?? `#${sub.userId}`).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-neutral-200 font-medium">
                            {sub.userName ?? `User #${sub.userId}`}
                          </p>
                          <p className="text-xs text-neutral-500">{sub.userEmail ?? ""}</p>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-neutral-300">
                        <Crown size={13} className="text-indigo-400" />
                        {sub.planName ?? getPlanName(sub.planId)}
                      </span>
                    </td>

                    {/* Billing */}
                    <td className="px-5 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-[#27272A] text-neutral-400 capitalize">
                        {sub.billingCycle}
                      </span>
                    </td>

                    {/* Period */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Calendar size={12} />
                        <span>{formatDate(sub.startDate)}</span>
                        <span>→</span>
                        <span>{formatDate(sub.endDate)}</span>
                      </div>
                    </td>

                    {/* Auto Renew */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${
                          sub.autoRenew ? "text-emerald-400" : "text-neutral-600"
                        }`}
                      >
                        <RefreshCw size={12} />
                        {sub.autoRenew ? "On" : "Off"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusStyle(
                          sub.status
                        )}`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272A] transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, subId: sub.id })}
                          className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#27272A] bg-[#151517] flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
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
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-[#1A1A1E] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Crown size={16} />
                  </div>
                  <h2 className="text-white font-semibold">
                    {editingSub ? "Edit Subscription" : "Assign Plan to User"}
                  </h2>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-neutral-500 hover:text-white hover:bg-[#27272A] rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
                {/* User Select */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    User <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}
                    className="w-full bg-[#0F0F12] border border-[#27272A] text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  >
                    <option value={0} disabled>Select user...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plan Select */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    Membership Plan <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.planId}
                    onChange={(e) => setForm({ ...form, planId: Number(e.target.value) })}
                    className="w-full bg-[#0F0F12] border border-[#27272A] text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  >
                    <option value={0} disabled>Select plan...</option>
                    {plans.filter((p) => p.isActive).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Billing Cycle */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    Billing Cycle
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BILLING_OPTIONS.map((cycle) => (
                      <button
                        key={cycle}
                        onClick={() => setForm({ ...form, billingCycle: cycle })}
                        className={`py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                          form.billingCycle === cycle
                            ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-400"
                            : "bg-[#0F0F12] border-[#27272A] text-neutral-400 hover:text-white"
                        }`}
                      >
                        {cycle}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full bg-[#0F0F12] border border-[#27272A] text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full bg-[#0F0F12] border border-[#27272A] text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, status: s })}
                        className={`py-2.5 rounded-xl text-xs font-medium border transition-all capitalize ${
                          form.status === s
                            ? s === "active"
                              ? "bg-green-500/10 border-green-500/40 text-green-400"
                              : s === "expired"
                              ? "bg-red-500/10 border-red-500/40 text-red-400"
                              : "bg-neutral-500/10 border-neutral-500/40 text-neutral-300"
                            : "bg-[#0F0F12] border-[#27272A] text-neutral-500 hover:text-white"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Renew */}
                <label className="flex items-center gap-3 px-4 py-3 bg-[#0F0F12] rounded-xl cursor-pointer hover:bg-[#151518] transition-colors group">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      form.autoRenew
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-[#3F3F46] text-transparent"
                    }`}
                  >
                    <RefreshCw size={12} />
                  </div>
                  <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                    Auto Renew
                  </span>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={form.autoRenew}
                    onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })}
                  />
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-[#27272A]">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#27272A] text-neutral-300 hover:bg-[#27272A] hover:text-white transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !form.userId || !form.planId}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors text-sm font-medium shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {editingSub ? "Save Changes" : "Assign Plan"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm({ isOpen: false, subId: null })}
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
                  <h3 className="text-xl font-bold text-white">Cancel Subscription?</h3>
                  <p className="text-neutral-400 text-sm">
                    This subscription will be permanently removed. The user will lose access to
                    their plan immediately.
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full mt-2">
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: false, subId: null })}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#27272A] text-neutral-300 hover:bg-[#27272A] hover:text-white transition-colors text-sm font-medium"
                  >
                    Keep It
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-medium shadow-lg shadow-red-500/20"
                  >
                    Remove
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

export default UserSubscriptionsList;
