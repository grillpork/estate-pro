"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { reportService, CreateReportDto } from "@/services/client/report";
import { toast } from "react-hot-toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId?: string;
  initialType?: CreateReportDto['type'];
  targetName?: string;
}

const ReportModal = ({ isOpen, onClose, targetId, initialType = 'other', targetName }: ReportModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customType, setCustomType] = useState("");
  const [formData, setFormData] = useState<CreateReportDto>({
    type: initialType,
    targetId: targetId,
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (payload.type === 'other' && customType.trim()) {
        payload.type = `อื่นๆ: ${customType.trim()}`;
      }
      await reportService.createReport(payload);
      setSuccess(true);
      toast.success("ส่งรายงานเรียบร้อยแล้ว");
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCustomType("");
        setFormData({ ...formData, title: "", description: "", type: initialType });
      }, 2000);
    } catch (error) {
      toast.error("มีบางอย่างผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#111118] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-red-500/10 to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">รายงานปัญหา</h2>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">แจ้งแอดมินให้ตรวจสอบทันที</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-6 scale-125">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">ขอบคุณสำหรับการรายงาน</h3>
                <p className="text-sm text-white/40 leading-relaxed">แอดมินได้รับข้อมูลแล้วและจะรีบดำเนินการตรวจสอบให้เร็วที่สุดครับ</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                {targetName && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
                    <span className="text-white/40">กำลังรายงาน: </span>
                    <span className="text-amber-500 font-bold">{targetName}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 mb-2 block">ประเภทปัญหา</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="website">ปัญหาเกี่ยวกับเว็ปไซต์</option>
                      <option value="seller">ปัญหาเกี่ยวกับผู้ประกาศขาย/เช่าอสังหาฯ</option>
                      <option value="buyer">ปัญหาเกี่ยวกับผู้ซื้อ/เช่าอสังหาฯ</option>
                      <option value="other">อื่นๆ (ระบุเพิ่มเติม)</option>
                    </select>
                  </div>

                  {formData.type === 'other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 mb-2 block">ระบุประเภทปัญหาอื่นๆ</label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น ปัญหาทางเทคนิค, แจ้งข้อเสนอแนะ..."
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                    </motion.div>
                  )}

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 mb-2 block">หัวข้อ</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น พบข้อมูลไม่ถูกต้อง, เว็บค้าง..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 mb-2 block">รายละเอียด</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="อธิบายปัญหาที่คุณพบอย่างละเอียด..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-400 disabled:bg-red-500/50 text-white font-bold py-4 rounded-3xl shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      ส่งรายงาน
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ReportModal;
