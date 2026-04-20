"use client";
import { useEffect, useState } from "react";
import { brandsService } from "@/services/client/brands";
import {
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Filter,
  Check,
  X,
  Plus,
  Edit2,
  Building2,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Brand = {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
};

const CATEGORIES = [
  { value: "DETACHED_HOUSE", label: "บ้านเดี่ยว" },
  { value: "TWIN_HOUSE", label: "บ้านแฝด" },
  { value: "TOWNHOME", label: "ทาวน์โฮม" },
  { value: "CONDOMINIUM", label: "คอนโดมิเนียม" },
];

const BrandManagement = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterCategory, setFilterCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({ name: "", category: "CONDOMINIUM" });

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    brandId: number | null;
  }>({ isOpen: false, brandId: null });

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const data = await brandsService.getAllBrands();
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    let result = brands;

    if (filterCategory !== "all") {
      result = result.filter((b) => b.category === filterCategory);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(lowerTerm));
    }

    setFilteredBrands(result);
    setCurrentPage(1);
  }, [brands, filterCategory, searchTerm]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleOpenModal = (brand: Brand | null = null) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({ name: brand.name, category: brand.category });
    } else {
      setEditingBrand(null);
      setFormData({ name: "", category: "CONDOMINIUM" });
    }
    setModalOpen(true);
  };

  const handleSaveBrand = async () => {
    if (!formData.name) return;

    try {
      if (editingBrand) {
        await brandsService.updateBrand(editingBrand.id, formData);
      } else {
        await brandsService.createBrand({ ...formData, isActive: true });
      }
      fetchBrands();
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving brand:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmation({ isOpen: true, brandId: id });
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.brandId === null) return;
    try {
      await brandsService.deleteBrand(deleteConfirmation.brandId);
      setBrands((prev) => prev.filter((b) => b.id !== deleteConfirmation.brandId));
    } catch (error) {
      console.error("Error deleting brand:", error);
    } finally {
      setDeleteConfirmation({ isOpen: false, brandId: null });
    }
  };

  const toggleStatus = async (brand: Brand) => {
    try {
      await brandsService.updateBrand(brand.id, { isActive: !brand.isActive });
      setBrands((prev) =>
        prev.map((b) => (b.id === brand.id ? { ...b, isActive: !b.isActive } : b)),
      );
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0F0F12] overflow-hidden p-6 gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
            โครงการ (Brands)
          </h1>
          <p className="text-neutral-400 text-sm">
            จัดการข้อมูลโครงการและแบรนด์สำหรับอสังหาริมทรัพย์
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} />
            เพิ่มโครงการ
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative group w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="ค้นหาโครงการ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A1A1E] text-neutral-300 pl-10 pr-4 py-2.5 rounded-xl border border-[#27272A] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600 text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#1A1A1E] text-neutral-300 px-4 py-2.5 rounded-xl border border-[#27272A] focus:outline-none focus:border-indigo-500/50 text-sm"
          >
            <option value="all">ประเภททั้งหมด</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl overflow-hidden flex-1 flex flex-col shadow-sm">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#27272A] bg-[#151517]">
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">ID</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">ชื่อโครงการ</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500">ประเภท</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-center">สถานะ</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-neutral-500 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-neutral-500">กำลังโหลด...</td>
                </tr>
              ) : paginatedBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-neutral-500">ไม่พบข้อมูลโครงการ</td>
                </tr>
              ) : (
                paginatedBrands.map((brand) => (
                  <tr key={brand.id} className="group hover:bg-[#202024] transition-colors">
                    <td className="px-6 py-4 text-sm text-neutral-500">#{brand.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white">{brand.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-400 text-xs">
                        {CATEGORIES.find((c) => c.value === brand.category)?.label || brand.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(brand)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          brand.isActive
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500 hover:bg-neutral-500/20"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${brand.isActive ? "bg-green-500" : "bg-red-500"}`} />
                        {brand.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(brand)}
                          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272A] transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="ลบ"
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

        {/* Pagination */}
        <div className="p-4 border-t border-[#27272A] bg-[#151517] flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            แสดง {paginatedBrands.length} จาก {filteredBrands.length} รายการ
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272A] disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-neutral-400 px-2">หน้า {currentPage} จาก {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272A] disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Add/Edit Brand */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#1A1A1E] border border-[#27272A] rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingBrand ? "แก้ไขโครงการ" : "เพิ่มโครงการใหม่"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-neutral-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">
                    ชื่อโครงการ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น Nue REN, Life, Aspire..."
                    className="w-full bg-[#0F0F12] border border-[#27272A] rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">
                    ประเภทอสังหาริมทรัพย์ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#0F0F12] border border-[#27272A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-[#27272A] text-neutral-300 hover:bg-[#27272A] transition-colors text-sm font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSaveBrand}
                    className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-medium shadow-lg shadow-indigo-600/20"
                  >
                    {editingBrand ? "บันทึกการแก้ไข" : "เพิ่มโครงการ"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmation({ isOpen: false, brandId: null })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#1A1A1E] border border-[#27272A] rounded-2xl shadow-2xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">ยืนยันการลบ?</h3>
              <p className="text-neutral-400 text-sm mb-6">
                คุณแน่ใจหรือไม่ที่จะลบโครงการนี้? ข้อมูลโครงการจะหายไปจากระบบทันที
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, brandId: null })}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#27272A] text-neutral-300 hover:bg-[#27272A] transition-colors text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-medium"
                >
                  ลบออก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandManagement;
