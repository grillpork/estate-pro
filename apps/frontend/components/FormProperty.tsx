"use client";
import { useEffect, useState } from "react";
import {
  propertyService,
  updatePropertyService,
} from "@/services/client/property";
import { useForm } from "react-hook-form";
import {
  Car,
  Plus,
  Minus,
  Image as ImageIcon,
  Cctv,
  ShieldCheck,
  AirVent,
  WashingMachine,
  Dumbbell,
  ChevronDown,
  Check,
  X,
  PawPrint,
  Pause,
  WavesLadder,
} from "lucide-react";
import { useRouter } from "next/navigation";
// ใช้ framer-motion สำหรับทำแอนิเมชัน dropdown และ dialog
import { motion, AnimatePresence } from "framer-motion";

// กำหนดโครงข้อมูลหลักของฟอร์มประกาศทรัพย์สิน
interface PropertyFormData {
  id?: string;
  title: string;
  description: string;
  floor: string;
  building: string;
  bedroom: number;
  bathroom: number;
  size: number;
  rai: number;
  ngan: number;
  squareWah: number;
  price: number;
  address: string;
  image: string;
  status: "pending" | "approved" | "rejected";
  type: "rent" | "buy";
  category: "house" | "condo" | "land";
  furnitureStatus: "complete" | "partial" | "empty";
  amenities: string[];
}

interface ListingType {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

// รายการสิ่งอำนวยความสะดวก "ส่วนกลางโครงการ"
const commonAreaAmenities = [
  { value: "ลิฟต์", label: "ลิฟต์", icon: <Pause size={18} /> },
  { value: "ที่จอดรถ", label: "ที่จอดรถ", icon: <Car size={18} /> },
  { value: "ฟิตเนส", label: "ฟิตเนส", icon: <Dumbbell size={18} /> },
  { value: "สระว่ายน้ำ", label: "สระว่ายน้ำ", icon: <WavesLadder size={18} /> },
];

// รายการสิ่งอำนวยความสะดวก "ภายในห้อง"
const roomAmenities = [
  { value: "เลี้ยงสัตว์ได้", label: "เลี้ยงสัตว์ได้", icon: <PawPrint size={18} /> },
  { value: "กล้อง CCTV", label: "กล้อง CCTV", icon: <Cctv size={18} /> },
  { value: "รปภ. 24 ชม.", label: "รปภ. 24 ชม.", icon: <ShieldCheck size={18} /> },
  { value: "แอร์ (AC)", label: "แอร์ (AC)", icon: <AirVent size={18} /> },
  { value: "เครื่องซักผ้า", label: "เครื่องซักผ้า", icon: <WashingMachine size={18} /> },
];

// ตัวเลือกประเภททรัพย์สิน
const categoryOptions = [
  { id: 1, name: "condo", label: "คอนโด" },
  { id: 2, name: "house", label: "บ้าน" },
  { id: 3, name: "land", label: "ที่ดิน" },
];

// คอมโพเนนต์หลักสำหรับฟอร์มสร้าง/แก้ไขประกาศทรัพย์สิน
const ListingProperty = ({ initialData, onSubmit, onCancel }: ListingType) => {
  const router = useRouter();
  // เปิด/ปิด dropdown ประเภททรัพย์สิน
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  // เก็บ error จากฝั่ง API
  const [apiError, setApiError] = useState<string | null>(null);
  // state สำหรับเปิด/ปิดกล่องยืนยันก่อนส่งฟอร์ม
  const [showConfirmation, setShowConfirmation] = useState(false);
  // เก็บข้อมูลฟอร์มที่ format แล้วไว้ใช้ตอนยืนยันส่ง
  const [formData, setFormData] = useState<any>(null);
  // สถานะระหว่างกำลังยืนยัน (ป้องกันกดซ้ำ)
  const [isConfirming, setIsConfirming] = useState(false);

  // State สำหรับรูปภาพ
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.mainImage ? `http://localhost:4000/${initialData.mainImage}` : null);

  // ตั้งค่า react-hook-form พร้อมค่าเริ่มต้น
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    // ถ้ามี initialData ให้ใช้เป็นค่าเริ่มต้น (โหมดแก้ไข) ถ้าไม่มีก็ใช้ค่าด้านล่าง (โหมดสร้างใหม่)
    defaultValues: initialData || {
      type: "rent",
      category: "condo",
      bedroom: 0,
      bathroom: 0,
      size: 0,
      rai: 0,
      ngan: 0,
      squareWah: 0,
      furnitureStatus: "empty",
      amenities: [],
      floor: "",
      building: "", 
      address: "",
      image: "",
    },
    mode: "onSubmit",
  });

  const watchType = watch("type");
  const watchCategory = watch("category");
  const watchFurniture = watch("furnitureStatus");
  const watchAmenities = watch("amenities") || [];

  // เมื่อมี initialData
  useEffect(() => {
    if (initialData) {
      setValue("title", initialData.title);
      setValue("description", initialData.description);
      setValue("floor", initialData.floor || "");
      setValue("bedroom", initialData.bedroom || 0);
      setValue("bathroom", initialData.bathroom || 0);
      setValue("size", initialData.size || 0);
      setValue("rai", initialData.rai || 0);
      setValue("ngan", initialData.ngan || 0);
      setValue("squareWah", initialData.squareWah || 0);
      setValue("building", initialData.building || "");
      setValue("price", initialData.price);
      setValue("address", initialData.address || "");
      setValue("image", initialData.image || "");
      setValue("status", initialData.status);
      setValue("type", initialData.type || "rent");
      setValue("category", initialData.category || "condo");
      setValue("furnitureStatus", initialData.furnitureStatus || "empty");
      if (Array.isArray(initialData.amenities)) {
        setValue("amenities", initialData.amenities);
      }
    }
  }, [initialData, setValue]);

  // ฟังก์ชันสลับการเลือก/ยกเลิกเลือกสิ่งอำนวยความสะดวก
  const toggleAmenity = (val: string) => {
    const current = [...watchAmenities];
    const index = current.indexOf(val);
    if (index > -1) current.splice(index, 1);
    else current.push(val);
    setValue("amenities", current);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // handle submit (ขั้นแรก: ตรวจสอบ/จัดรูปแบบข้อมูล และเปิดกล่องยืนยัน)
  const onSubmitForm = async (data: any) => {
    setApiError(null);
    
    // รวม floor และ building เป็น address ถ้าไม่มี address
    let finalAddress = data.address || "";
    if (!finalAddress && (data.floor || data.building)) {
      const addressParts = [];
      if (data.floor) addressParts.push(`ชั้น ${data.floor}`);
      if (data.building) addressParts.push(data.building);
      finalAddress = addressParts.join(", ");
    }

    // จัดรูปแบบข้อมูลตัวเลข/ฟิลด์ต่าง ๆ ก่อนส่งไป backend
    const formatedData = {
      ...data,
      price: Number(data.price),
      bedroom: Number(data.bedroom),
      bathroom: Number(data.bathroom),
      size: Number(data.size),
      rai: Number(data.rai) || 0,
      ngan: Number(data.ngan) || 0,
      squareWah: Number(data.squareWah) || 0,
      type: data.type === "buy" ? "sale" : "rent", // แปลง buy เป็น sale สำหรับ backend
      address: finalAddress || data.address || "",
    };

    // เก็บข้อมูลไว้ใน state และแสดงกล่องยืนยันก่อนส่งจริง
    setFormData(formatedData);
    setShowConfirmation(true);
  };

  // ฟังก์ชันยืนยันการ submit (ขั้นตอนที่สอง: เรียก API จริง)
  const confirmSubmit = async () => {
    if (!formData) return;

    setIsConfirming(true);
    setApiError(null);
    try {
      let propertyId = initialData?.id;

      if (initialData) {
        // ถ้ามี initialData แสดงว่าเป็นการอัปเดตประกาศเดิม
        await updatePropertyService(initialData.id, formData);
      } else {
        // ถ้าไม่มี initialData แสดงว่าเป็นการสร้างประกาศใหม่
        const response = await propertyService.createProperty(formData);
        propertyId = response.id;
      }

      // ถ้ามีรูปที่เลือกไว้ ให้อัปโหลดรูปด้วย
      if (selectedFile && propertyId) {
        await propertyService.updatePropertyImage(propertyId, selectedFile);
      }

      if (onSubmit) {
        await onSubmit(formData);
      }

      // ถ้าเป็นการสร้างใหม่ให้เคลียร์ฟอร์มหลังส่งสำเร็จ
      if (!initialData) {
        reset();
        setValue("amenities", []);
      }

      // ปิด confirmation dialog
      setShowConfirmation(false);
      setFormData(null);
    } catch (error : any) {
      setApiError("เกิดข้อผิดพลาดในการสร้างทรัพย์สิน");
      console.error(error);
      setShowConfirmation(false);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="bg-[#0F0F12] min-h-screen py-10 px-4">
      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="max-w-4xl mx-auto bg-[#1A1A1E] p-8 rounded-3xl border border-[#27272A] space-y-10"
      >
        {/* Header Section */}
        <section>
          <h1 className="text-2xl font-bold text-white">เริ่มลงประกาศของคุณ</h1>
          <p className="text-neutral-400">
            กรอกข้อมูลให้ครบถ้วน เพื่อให้ผู้ค้นหาเจออสังหาฯ ของคุณได้ง่ายขึ้น
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {[
              { 
                id: "rent", 
                label: "เช่า",
                description1: "จ่ายเพื่อ \"ใช้\"",
                description2: "(เจ้าของยังเป็นคนเดิม)"
              },
              { 
                id: "buy", 
                label: "ขาย",
                description1: "จ่ายเพื่อ \"เป็นเจ้าของ\"",
                description2: "(โอนกรรมสิทธิ์ให้)"
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setValue("type", item.id as any)}
                className={`p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${
                  watchType === item.id
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-[#27272A] bg-[#0F0F12] text-neutral-400 hover:text-white"
                }`}
              >
                <div className="text-left">
                  <p className="font-bold">{item.label}</p>
                  <p className="text-xs opacity-80">
                    {item.description1}
                  </p>
                  <p className="text-xs opacity-80">
                    {item.description2}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    watchType === item.id ? "border-white" : "border-neutral-600"
                  }`}
                >
                  {watchType === item.id && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/*  1.ข้อมูลและทำเลอสังหา*/}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
              1
            </span>
            <h2 className="text-lg font-bold text-white">ข้อมูลและทำเลอสังหา</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-white">
                ชื่อโครงการ / ทรัพย์สิน <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title", { 
                  required: "กรุณากรอกชื่อโครงการ / ทรัพย์สิน" 
                })}
                className={`w-full p-4 bg-[#0F0F12] text-white rounded-xl border outline-none transition placeholder:text-neutral-600 ${
                  errors.title 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-[#27272A] focus:border-indigo-500"
                }`}
                placeholder="ชื่อโครงการ"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>
              )}
            </div>

           
            {/* ประเภททรัพย์สิน + ราคา */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-white">
                  ประเภท <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register("category", { 
                      required: "กรุณาเลือกประเภท" 
                    })}
                    type="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className={`w-full flex items-center gap-2 p-4.5 rounded-xl border transition-all text-sm font-medium ${
                      categoryDropdownOpen
                        ? "bg-[#0F0F12] border-indigo-500/50 text-white"
                        : errors.category
                        ? "bg-[#0F0F12] border-red-500 text-neutral-400 hover:text-white"
                        : "bg-[#0F0F12] border-[#27272A] text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span className="flex-1 text-left">
                      {categoryOptions.find((c) => c.name === watchCategory)
                        ?.label || "เลือกประเภท"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        categoryDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">{errors.category.message as string}</p>
                  )}

                  <AnimatePresence>
                    {categoryDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 top-full mt-2 w-full bg-[#1A1A1E] border border-[#27272A] rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden"
                      >
                        <div className="p-1">
                          {categoryOptions.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setValue("category", option.name as any, { shouldValidate: true });
                                setCategoryDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                watchCategory === option.name
                                  ? "bg-indigo-600/10 text-indigo-400 font-medium"
                                  : "text-neutral-400 hover:bg-[#27272A] hover:text-white"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  watchCategory === option.name
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
              <div>
                <label className="text-sm font-medium mb-1 block text-white">
                  ราคา <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register("price", { 
                      required: "กรุณากรอกราคา",
                      min: { value: 1, message: "ราคาต้องมากกว่า 0" }
                    })}
                    type="number"
                    className={`w-full p-4 pr-12 bg-[#0F0F12] text-white rounded-xl border outline-none transition placeholder:text-neutral-600 ${
                      errors.price 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-[#27272A] focus:border-indigo-500"
                    }`}
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-4 text-neutral-400">฿</span>
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price.message as string}</p>
                )}
              </div>
            </div>

            {/* แสดงเฉพาะคอนโดและบ้าน */}
            {(watchCategory === "condo" || watchCategory === "house") && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-neutral-400">ห้องนอน </p>
                  <div className="flex items-center justify-center gap-4 bg-[#0F0F12] rounded-xl p-2 border border-[#27272A]">
                    <button
                      type="button"
                      onClick={() =>
                        setValue("bedroom", Math.max(0, watch("bedroom") - 1))
                      }
                      className="text-neutral-400 hover:text-white"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-bold w-4 text-white">
                      {watch("bedroom")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setValue("bedroom", watch("bedroom") + 1)}
                      className="text-neutral-400 hover:text-white"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-neutral-400">ห้องน้ำ </p>
                  <div className="flex items-center justify-center gap-4 bg-[#0F0F12] rounded-xl p-2 border border-[#27272A]">
                    <button
                      type="button"
                      onClick={() =>
                        setValue("bathroom", Math.max(0, watch("bathroom") - 1))
                      }
                      className="text-neutral-400 hover:text-white"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-bold w-4 text-white">
                      {watch("bathroom")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setValue("bathroom", watch("bathroom") + 1)}
                      className="text-neutral-400 hover:text-white"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-neutral-400">พื้นที่ใช้สอย ตร.ม.</p>
                  <input
                    {...register("size")}
                    type="number"
                    className="w-full p-2 text-center bg-[#0F0F12] text-white rounded-xl border border-[#27272A] font-bold outline-none placeholder:text-neutral-600"
                    placeholder="1"
                  />
                </div>

                {/* ชั้น และ ตึก - แสดงเฉพาะคอนโด */}
                {watchCategory === "condo" && (
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block text-white ">
                        ชั้น Floor <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("floor", { 
                          required: "กรุณากรอกชั้น" 
                        })}
                        className={`w-full p-4 bg-[#0F0F12] text-white rounded-xl border outline-none placeholder:text-neutral-600 ${
                          errors.floor 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-[#27272A] focus:border-indigo-500"
                        }`}
                        placeholder="เช่น 12 A"
                      />
                      {errors.floor && (
                        <p className="text-red-500 text-xs mt-1">{errors.floor.message as string}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-white">
                        ตึก / อาคาร <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("building", { 
                          required: "กรุณากรอกตึก / อาคาร" 
                        })}
                        className={`w-full p-4 bg-[#0F0F12] text-white rounded-xl border outline-none placeholder:text-neutral-600 ${
                          errors.building 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-[#27272A] focus:border-indigo-500"
                        }`}
                        placeholder="เช่น อาคาร B"
                      />
                      {errors.building && (
                        <p className="text-red-500 text-xs mt-1">{errors.building.message as string}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ขนาดที่ดิน - แสดงเฉพาะบ้าน */}
                {watchCategory === "house" && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-white">
                        ขนาดที่ดิน <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register("rai", { 
                            required: watchCategory === "house" ? "กรุณากรอกขนาดที่ดิน" : false,
                            validate: (value) => {
                              if (watchCategory === "house") {
                                const rai = Number(value) || 0;
                                const ngan = Number(watch("ngan")) || 0;
                                const squareWah = Number(watch("squareWah")) || 0;
                                if (rai === 0 && ngan === 0 && squareWah === 0) {
                                  return "กรุณากรอกขนาดที่ดินอย่างน้อย 1 ฟิลด์";
                                }
                              }
                              return true;
                            }
                          })}
                          type="number"
                          className={`w-full p-4 pr-12 bg-[#0F0F12] text-white rounded-xl border outline-none placeholder:text-neutral-600 ${
                            errors.rai 
                              ? "border-red-500 focus:border-red-500" 
                              : "border-[#27272A] focus:border-indigo-500"
                          }`}
                          placeholder="0"
                        />
                        <span className="absolute right-4 top-4 text-neutral-400">ไร่</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-white">
                        &nbsp;
                      </label>
                      <div className="relative">
                        <input
                          {...register("ngan")}
                          type="number"
                          className={`w-full p-4 pr-12 bg-[#0F0F12] text-white rounded-xl border outline-none placeholder:text-neutral-600 ${
                            errors.rai 
                              ? "border-red-500 focus:border-red-500" 
                              : "border-[#27272A] focus:border-indigo-500"
                          }`}
                          placeholder="0"
                        />
                        <span className="absolute right-4 top-4 text-neutral-400">งาน</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-white">
                        &nbsp;
                      </label>
                      <div className="relative">
                        <input
                          {...register("squareWah")}
                          type="number"
                          className={`w-full p-4 pr-12 bg-[#0F0F12] text-white rounded-xl border outline-none placeholder:text-neutral-600 ${
                            errors.rai 
                              ? "border-red-500 focus:border-red-500" 
                              : "border-[#27272A] focus:border-indigo-500"
                          }`}
                          placeholder="0"
                        />
                        <span className="absolute right-4 top-4 text-neutral-400">ตร.วา</span>
                      </div>
                    </div>
                    {(errors.rai || errors.ngan || errors.squareWah) && (
                      <div className="md:col-span-3">
                        <p className="text-red-500 text-xs mt-1">
                          {errors.rai?.message as string || errors.ngan?.message as string || errors.squareWah?.message as string}
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="md:col-span-3">
                  <label className="text-sm font-medium mb-2 block text-white">
                    การตกแต่ง furniture
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "complete", label: "เฟอร์นิเจอร์ครบ" },
                      { id: "partial", label: "บางส่วน" },
                      { id: "empty", label: "ห้องเปล่า" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setValue("furnitureStatus", item.id as any)}
                        className={`p-3 text-sm rounded-xl transition-all border ${
                          watchFurniture === item.id
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-[#0F0F12] text-neutral-400 border-[#27272A] hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* กรณีประเภท "ที่ดิน": ขนาดที่ดิน + ที่อยู่ */}
            {watchCategory === "land" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="text-sm font-medium mb-1 block text-white">
                    ขนาดที่ดิน <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="relative">
                  <input
                    {...register("rai", {
                      validate: (value) => {
                        if (watchCategory === "land") {
                          const rai = Number(value) || 0;
                          const ngan = Number(watch("ngan")) || 0;
                          const squareWah = Number(watch("squareWah")) || 0;
                          if (rai === 0 && ngan === 0 && squareWah === 0) {
                            return "กรุณากรอกขนาดที่ดินอย่างน้อย 1 ฟิลด์";
                          }
                        }
                        return true;
                      },
                    })}
                    type="number"
                    className={`w-full p-4 pr-12 bg-[#0F0F12] text-white rounded-xl border outline-none placeholder:text-neutral-600 ${
                      errors.rai
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#27272A] focus:border-indigo-500"
                    }`}
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-4 text-neutral-400">ไร่</span>
                </div>
                <div className="relative">
                  <input
                    {...register("ngan")}
                    type="number"
                    className={`w-full p-4 pr-12 bg-[#0F0F12] text-white rounded-xl border outline-none placeholder:text-neutral-600 ${
                      errors.rai
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#27272A] focus:border-indigo-500"
                    }`}
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-4 text-neutral-400">งาน</span>
                </div>
                <div className="relative">
                  <input
                    {...register("squareWah")}
                    type="number"
                    className={`w-full p-4 pr-12 bg-[#0F0F12] text-white rounded-xl border outline-none placeholder:text-neutral-600 ${
                      errors.rai
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#27272A] focus:border-indigo-500"
                    }`}
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-4 text-neutral-400">ตร.วา</span>
                </div>

                {(errors.rai || errors.ngan || errors.squareWah) && (
                  <div className="md:col-span-3">
                    <p className="text-red-500 text-xs mt-1">
                      {(errors.rai?.message as string) ||
                        (errors.ngan?.message as string) ||
                        (errors.squareWah?.message as string)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/*  2: รูปภาพอสังหา ยังใช้ไม่ได้*/}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
              2
            </span>
            <h2 className="text-lg font-bold text-white">รูปภาพอสังหา</h2>
          </div>
          <div 
            onClick={() => document.getElementById('image-upload')?.click()}
            className="group relative border-2 border-dashed border-[#27272A] rounded-3xl p-4 min-h-[300px] flex flex-col items-center justify-center gap-4 hover:bg-[#0F0F12] transition cursor-pointer overflow-hidden"
          >
            {previewUrl ? (
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={previewUrl} 
                  alt="Property preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-medium">เปลี่ยนรูปภาพ</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-[#0F0F12] rounded-full text-neutral-400">
                  <ImageIcon size={40} />
                </div>
                <p className="text-sm text-neutral-400">
                  คลิกเพื่ออัพโหลดรูปภาพหน้าปก
                </p>
              </>
            )}
            <input 
              id="image-upload"
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </section>

        {/*  3: สิ่งอำนวยความสะดวก แยกตามประเภททรัพย์สิน */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
              3
            </span>
            <h2 className="text-lg font-bold text-white">สิ่งอำนวยความสะดวก</h2>
          </div>

          {/* ถ้าเป็นที่ดินจะไม่มีรายการสิ่งอำนวยความสะดวกให้เลือก */}
          {watchCategory === "land" ? (
            <div>
              <p className="text-neutral-400 text-sm">ไม่มีข้อมูล</p>
            </div>
          ) : watchCategory === "house" ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3">
                  เฟอร์นิเจอร์และเครื่องใช้ไฟฟ้าในห้อง
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {roomAmenities.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleAmenity(item.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm ${
                        watchAmenities.includes(item.value)
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                          : "bg-[#0F0F12] border-[#27272A] text-neutral-400 hover:text-white hover:border-[#27272A]"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ส่วนกลางโครงการ - แสดงเฉพาะคอนโด */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3">
                  ส่วนกลางโครงการ
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {commonAreaAmenities.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleAmenity(item.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm ${
                        watchAmenities.includes(item.value)
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                          : "bg-[#0F0F12] border-[#27272A] text-neutral-400 hover:text-white hover:border-[#27272A]"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* เฟอร์นิเจอร์และเครื่องใช้ไฟฟ้าในห้อง */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3">
                  เฟอร์นิเจอร์และเครื่องใช้ไฟฟ้าในห้อง
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {roomAmenities.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleAmenity(item.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm ${
                        watchAmenities.includes(item.value)
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                          : "bg-[#0F0F12] border-[#27272A] text-neutral-400 hover:text-white hover:border-[#27272A]"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/*  4: แผนที่ */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
              4
            </span>
            <h2 className="text-lg font-bold text-white">แผนที่</h2>
          </div>
        </section>

        {/* แสดงข้อความ error กรณี API มีปัญหา */}
        {apiError && (
          <p className="text-sm text-red-500 text-center">{apiError}</p>
        )}

        {/* ปุ่มกดท้ายฟอร์ม: ย้อนกลับ + บันทึก/อัปเดต */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-5 py-3 rounded-2xl border border-[#27272A] text-sm text-neutral-400 hover:bg-[#0F0F12] hover:text-white transition"
          >
            ย้อนกลับ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSubmitting
              ? "กำลังบันทึก..."
              : initialData
              ? "อัปเดต"
              : "ถัดไป"}
          </button>
        </div>
      </form>

      {/* กล่องยืนยันก่อนส่งข้อมูลไป backend จริง */}
      <AnimatePresence>
        {showConfirmation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowConfirmation(false);
                setFormData(null);
              }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-[#1A1A1E] border border-[#27272A] rounded-2xl shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                  <Check size={24} />
                </div>
                <div className="space-y-2 w-full">
                  <h3 className="text-xl font-bold text-white">
                    {initialData ? "ยืนยันการอัปเดต?" : "ยืนยันการลงประกาศ?"}
                  </h3>
                  <p className="text-neutral-400 text-sm">
                    {initialData
                      ? "คุณแน่ใจหรือไม่ที่จะอัปเดตประกาศนี้? ประกาศจะถูกส่งไปให้ admin ตรวจสอบอีกครั้ง"
                      : "คุณแน่ใจหรือไม่ที่จะลงประกาศทรัพย์สินนี้? ประกาศจะถูกส่งไปให้ admin ตรวจสอบ"}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full mt-2">
                  <button
                    onClick={() => {
                      setShowConfirmation(false);
                      setFormData(null);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#27272A] text-neutral-300 hover:bg-[#27272A] hover:text-white transition-colors text-sm font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={confirmSubmit}
                    disabled={isConfirming}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors text-sm font-medium shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConfirming ? "กำลังบันทึก..." : initialData ? "อัปเดต" : "ยืนยัน"}
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

export default ListingProperty;
