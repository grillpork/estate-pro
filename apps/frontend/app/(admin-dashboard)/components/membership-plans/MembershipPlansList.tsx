"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Crown,
  MessageCircle,
  Eye,
  ListChecks,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
} from "lucide-react";
import {
  adminMembershipPlansService,
  MembershipPlan,
  CreateMembershipPlanPayload,
} from "@/services/admin/membershipPlans";

const emptyForm: CreateMembershipPlanPayload = {
  name: "",
  description: "",
  priceMonthly: "0",
  priceYearly: "0",
  maxListings: 1,
  canViewOwnerContact: false,
  isActive: true,
};

const MembershipPlansList = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [form, setForm] = useState<CreateMembershipPlanPayload>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; planId: number | null }>(
    { isOpen: false, planId: null }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const data = await adminMembershipPlansService.getAllPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      maxListings: plan.maxListings,
      canViewOwnerContact: plan.canViewOwnerContact,
      isActive: plan.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editingPlan) {
        const updated = await adminMembershipPlansService.updatePlan(editingPlan.id, form);
        setPlans(plans.map((p) => (p.id === editingPlan.id ? updated : p)));
      } else {
        const created = await adminMembershipPlansService.createPlan(form);
        setPlans([...plans, created]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save plan:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (plan: MembershipPlan) => {
    try {
      const updated = await adminMembershipPlansService.updatePlan(plan.id, {
        isActive: !plan.isActive,
      });
      setPlans(plans.map((p) => (p.id === plan.id ? updated : p)));
    } catch (err) {
      console.error("Failed to toggle plan:", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.planId) return;
    try {
      await adminMembershipPlansService.deletePlan(deleteConfirm.planId);
      setPlans(plans.filter((p) => p.id !== deleteConfirm.planId));
    } catch (err) {
      console.error("Failed to delete plan:", err);
    } finally {
      setDeleteConfirm({ isOpen: false, planId: null });
    }
  };

  const formatPrice = (price: string) =>
    Number(price).toLocaleString("th-TH", { style: "currency", currency: "THB" });

  const activePlans = plans.filter((p) => p.isActive).length;

  return (
    <div className="w-full flex flex-col h-full bg-[#0F0F12] overflow-hidden p-6 gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
            Membership Plans
          </h1>
          <p className="text-neutral-400 text-sm">
            {activePlans} active plan{activePlans !== 1 ? "s" : ""} · {plans.length} total
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={16} />
          New Plan
        </button>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl p-6 animate-pulse h-64"
            />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-neutral-500">
          <Crown size={48} strokeWidth={1.5} className="text-neutral-700" />
          <p className="text-sm">No membership plans yet.</p>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-sm transition-all border border-indigo-500/20"
          >
            <Plus size={14} />
            Create your first plan
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-2">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative bg-[#1A1A1E] border rounded-2xl p-6 flex flex-col gap-4 group transition-all ${plan.isActive
                  ? "border-[#27272A] hover:border-indigo-500/30"
                  : "border-[#27272A] opacity-60"
                  }`}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                      <Crown size={18} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base leading-tight">
                        {plan.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${plan.isActive
                          ? "bg-green-500/10 text-green-400"
                          : "bg-neutral-500/10 text-neutral-500"
                          }`}
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === plan.id ? null : plan.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-[#27272A] transition-colors"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <AnimatePresence>
                      {openMenuId === plan.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 w-44 bg-[#1A1A1E] border border-[#27272A] rounded-xl shadow-xl z-50 overflow-hidden"
                        >
                          <button
                            onClick={() => { openEditModal(plan); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:bg-[#27272A] hover:text-white transition-colors"
                          >
                            <Pencil size={14} /> Edit Plan
                          </button>
                          <button
                            onClick={() => { handleToggleActive(plan); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:bg-[#27272A] hover:text-white transition-colors"
                          >
                            {plan.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                            {plan.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <div className="border-t border-[#27272A] my-1" />
                          <button
                            onClick={() => { setDeleteConfirm({ isOpen: true, planId: plan.id }); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={14} /> Delete Plan
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Description */}
                <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2">
                  {plan.description || "No description provided."}
                </p>

                {/* Pricing */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-[#0F0F12] rounded-xl p-3 text-center">
                    <p className="text-xs text-neutral-500 mb-1">Monthly</p>
                    <p className="text-white font-semibold text-sm">
                      {formatPrice(plan.priceMonthly)}
                    </p>
                  </div>
                  <div className="flex-1 bg-[#0F0F12] rounded-xl p-3 text-center">
                    <p className="text-xs text-neutral-500 mb-1">Yearly</p>
                    <p className="text-indigo-400 font-semibold text-sm">
                      {formatPrice(plan.priceYearly)}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[#0F0F12] text-neutral-400">
                    <ListChecks size={12} />
                    {plan.maxListings} Listings
                  </span>
                  <span
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${plan.canViewOwnerContact
                      ? "bg-sky-500/10 text-sky-400"
                      : "bg-[#0F0F12] text-neutral-600 line-through"
                      }`}
                  >
                    <Eye size={12} />
                    Owner Contact
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

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
                    {editingPlan ? "Edit Plan" : "Create New Plan"}
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
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    Plan Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Pro, Enterprise..."
                    className="w-full bg-[#0F0F12] border border-[#27272A] text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 placeholder:text-neutral-600 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={form.description ?? ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe what this plan offers..."
                    rows={3}
                    className="w-full bg-[#0F0F12] border border-[#27272A] text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 placeholder:text-neutral-600 transition-all resize-none"
                  />
                </div>

                {/* Pricing Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                      Price / Month (฿)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.priceMonthly}
                      onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })}
                      className="w-full bg-[#0F0F12] border border-[#27272A] text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                      Price / Year (฿)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.priceYearly}
                      onChange={(e) => setForm({ ...form, priceYearly: e.target.value })}
                      className="w-full bg-[#0F0F12] border border-[#27272A] text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                </div>

                {/* Max Listings */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    Max Listings
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxListings}
                    onChange={(e) => setForm({ ...form, maxListings: Number(e.target.value) })}
                    className="w-full bg-[#0F0F12] border border-[#27272A] text-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>

                {/* Permissions */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Permissions
                  </label>
                  {[
                    {
                      key: "canViewOwnerContact",
                      label: "Can View Owner Contact",
                      icon: <Eye size={14} />,
                    },
                    {
                      key: "isActive",
                      label: "Active (visible to users)",
                      icon: <Check size={14} />,
                    },
                  ].map(({ key, label, icon }) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 px-4 py-3 bg-[#0F0F12] rounded-xl cursor-pointer hover:bg-[#151518] transition-colors group"
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${form[key as keyof typeof form]
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-[#3F3F46] text-transparent"
                          }`}
                      >
                        {icon}
                      </div>
                      <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                        {label}
                      </span>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={!!form[key as keyof typeof form]}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.checked })
                        }
                      />
                    </label>
                  ))}
                </div>
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
                  disabled={isSubmitting || !form.name}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors text-sm font-medium shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {editingPlan ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm({ isOpen: false, planId: null })}
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
                  <h3 className="text-xl font-bold text-white">Delete Plan?</h3>
                  <p className="text-neutral-400 text-sm">
                    This plan will be permanently deleted. Users with active subscriptions on this
                    plan may be affected.
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full mt-2">
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: false, planId: null })}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#27272A] text-neutral-300 hover:bg-[#27272A] hover:text-white transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-medium shadow-lg shadow-red-500/20"
                  >
                    Delete Plan
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

export default MembershipPlansList;
