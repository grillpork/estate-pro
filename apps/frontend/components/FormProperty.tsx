"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  propertyService,
  updatePropertyService,
} from "@/services/client/property";
import { brandsService } from "@/services/client/brands";
import {
  Image as ImageIcon,
  X,
  Key,
  Save,
  Building2,
  Store,
  ChevronDown,
  Tag,
  Wand2,
  User,
  Phone,
  Calendar,
  Percent,
} from "lucide-react";
import { useRouter } from "next/navigation";
import MapPicker from "./MapPicker";

// --- Types ---
interface PropertyFormData {
  name: string;
  description: string;
  listingType: "SALES" | "RENT" | "SALE & RENT";
  brandId: number | string;
  address: string;
  province: string;
  district: string;
  subDistrict: string;
  zipCode: string;
  category: "DETACHED_HOUSE" | "TWIN_HOUSE" | "TOWNHOME" | "CONDOMINIUM";
  projectArea: string;
  landArea?: string;
  usableArea: string;
  totalUnits: number;
  parkingSpaces: number;
  parkingPercent: string;
  studio?: number;
  bedrooms: number;
  bathrooms: number;
  facing: string;
  floor: number | string;
  building: string;
  commonFee: string;
  latitude: string;
  longitude: string;
  amenities: string[];
  startingPrice: string;
  rentPrice?: string;
  estimatedInstallment?: string;
  discount?: string;
  discountActive?: boolean;
  discountType?: "BAHT" | "PERCENT";
  rentDiscount?: string;
  rentDiscountActive?: boolean;
  rentDiscountType?: "BAHT" | "PERCENT";
  rentNetTotal?: string;
  ownerName?: string;
  ownerPhone?: string;
  occupancy?: "VACANT" | "OCCUPIED";
  condition?: number;
  availableDate?: string;
}

interface Brand {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
}

interface ListingPropertyProps {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

// --- Constants ---
const AMENITIES = [
  { id: "karaoke", label: "ห้องคาราโอเกะ" },
  { id: "studio", label: "ห้องสตูดิโอ" },
  { id: "cinema", label: "ห้องดูหนัง" },
  { id: "laundry", label: "ห้องซักผ้า" },
  { id: "library", label: "ห้องสมุด" },
  { id: "intercom", label: "Intercom" },
  { id: "cctv", label: "กล้อง CCTV" },
  { id: "security", label: "รปภ. 24 ชั่วโมง" },
  { id: "emergency", label: "ระบบแจ้งเตือนเหตุฉุกเฉิน" },
  { id: "smokeDetector", label: "ระบบตรวจจับควัน" },
  { id: "parking", label: "ที่จอดรถ" },
  { id: "shuttleBus", label: "รถรับส่งฟรี" },
  { id: "lobby", label: "ล็อบบี้ส่วนกลาง" },
  { id: "smartLocker", label: "smart locker" },
  { id: "coWorking", label: "Co-Working Space" },
  { id: "privateRoom", label: "Private Working Rooms" },
  { id: "roofTop", label: "Roof Top" },
  { id: "joggingTrack", label: "Jogging Track" },
  { id: "meetingRoom", label: "Meeting Room" },
  { id: "garden", label: "สวนพักผ่อน" },
  { id: "playground", label: "สนามเด็กเล่น" },
  { id: "petFriendly", label: "เลี้ยงสัตว์ได้" },
  { id: "pool", label: "สระว่ายน้ำ" },
  { id: "lift", label: "ลิฟต์" },
  { id: "keyCard", label: "ระบบคีย์การ์ด" },
  { id: "faceScan", label: "ระบบสะแกนใบหน้า" },
];

const CATEGORIES = [
  { value: "DETACHED_HOUSE", label: "บ้านเดี่ยว" },
  { value: "TWIN_HOUSE", label: "บ้านแฝด" },
  { value: "TOWNHOME", label: "ทาวน์โฮม" },
  { value: "CONDOMINIUM", label: "คอนโดมิเนียม" },
];

const LISTING_TYPES = [
  { value: "SALES", label: "ขาย", icon: <Key size={14} /> },
  { value: "RENT", label: "เช่า", icon: <Building2 size={14} /> },
  { value: "SALE & RENT", label: "ขายและเช่า", icon: <Store size={14} /> },
];

const FACING_DIRECTIONS = [
  "เหนือ", "ใต้", "ตะวันออก", "ตะวันตก",
  "ตะวันออกเฉียงเหนือ", "ตะวันออกเฉียงใต้",
  "ตะวันตกเฉียงเหนือ", "ตะวันตกเฉียงใต้",
];

// --- Custom Dark Select Component ---
interface SelectOption {
  value: string;
  label: string;
}

function DarkSelect({
  options,
  value,
  onChange,
  placeholder = "เลือก...",
}: {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500 flex items-center justify-between"
      >
        <span className={value ? "text-white/80" : "text-white/30"}>{selectedLabel}</span>
        <ChevronDown
          size={18}
          className={`text-white/30 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 4, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 right-0 z-50 mt-1 bg-[#111118] border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="py-1 max-h-[240px] overflow-y-auto">
                {options.map(option => {
                  const isActive = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                        isActive
                          ? "text-white bg-white/5"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`w-1 h-5 rounded-full transition-colors ${
                          isActive ? "bg-amber-500" : "bg-transparent"
                        }`}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ListingProperty({ initialData, onSubmit, onCancel }: ListingPropertyProps) {
  const router = useRouter();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [language, setLanguage] = useState<"TH" | "EN">("TH");

  // Brands state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    defaultValues: initialData
      ? {
          ...initialData,
          brandId: initialData.brandId?.toString(),
          latitude: initialData.latitude?.toString(),
          longitude: initialData.longitude?.toString(),
        }
      : {
          listingType: "SALES",
          category: "CONDOMINIUM",
          bedrooms: 0,
          bathrooms: 0,
          amenities: [],
        },
  });

  const watchAmenities = watch("amenities") || [];
  const watchListingType = watch("listingType");
  const watchDiscountActive = watch("discountActive");
  const watchRentDiscountActive = watch("rentDiscountActive");
  const watchLat = watch("latitude");
  const watchLng = watch("longitude");

  // Load existing images on edit
  useEffect(() => {
    if (initialData?.images && initialData.images.length > 0 && previewUrls.length === 0) {
      setExistingImages(initialData.images);
      const existingUrls = initialData.images.map((img: any) => 
        `http://localhost:4000/${img.imagePath.replace(/\\/g, '/')}`
      );
      setPreviewUrls(existingUrls);
    }
  }, [initialData]);

  // Fetch brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        const data = await brandsService.getAllBrands();
        setBrands(data);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setBrandsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const toggleAmenity = (id: string) => {
    const current = [...watchAmenities];
    const index = current.indexOf(id);
    if (index > -1) current.splice(index, 1);
    else current.push(id);
    setValue("amenities", current);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFiles = (newFiles: File[]) => {
    const validImageFiles = newFiles.filter(f => f.type.startsWith("image/"));
    
    // Create blob URLs for the new files
    const newUrls = validImageFiles.map(file => URL.createObjectURL(file));

    setSelectedFiles(prev => {
      const combined = [...prev, ...validImageFiles];
      return combined.slice(0, 10);
    });

    setPreviewUrls(prev => {
      const combined = [...prev, ...newUrls];
      return combined.slice(0, 10);
    });
  };

  const removeImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const urlToRemove = previewUrls[index];
    
    // If it's a local blob URL, revoke it
    if (urlToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(urlToRemove);
      
      // Sync selectedFiles: find which file in selectedFiles matches this index
      const blobIndex = previewUrls.slice(0, index).filter(url => url.startsWith("blob:")).length;
      setSelectedFiles(prev => prev.filter((_, i) => i !== blobIndex));
    } else {
      // It's an existing image, find its ID and remove from existingImages
      // The logic is: previewUrls[0...n-1] contains [existing[0...m-1], local[0...k-1]]
      // So if it's not a blob, it matches existingImages[index]
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    }

    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFormSubmit = async (data: PropertyFormData) => {
    setIsConfirming(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        listingType: data.listingType,
        brandId: data.brandId ? Number(data.brandId) : undefined,
        startingPrice: data.startingPrice,
        rentPrice: data.rentPrice || undefined,
        category: data.category,
        projectArea: data.projectArea || undefined,
        landArea: data.landArea || undefined,
        usableArea: data.usableArea || undefined,
        totalUnits: data.totalUnits ? Number(data.totalUnits) : undefined,
        parkingSpaces: data.parkingSpaces ? Number(data.parkingSpaces) : undefined,
        parkingPercent: data.parkingPercent || undefined,
        studio: data.studio ? Number(data.studio) : undefined,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
        facing: data.facing || undefined,
        floor: data.floor ? Number(data.floor) : undefined,
        building: data.building || undefined,
        commonFee: data.commonFee || undefined,
        estimatedInstallment: data.estimatedInstallment || undefined,
        discount: data.discountActive ? data.discount : undefined,
        discountActive: data.discountActive || false,
        discountType: data.discountActive ? data.discountType : undefined,
        rentDiscount: data.rentDiscountActive ? data.rentDiscount : undefined,
        rentDiscountActive: data.rentDiscountActive || false,
        rentDiscountType: data.rentDiscountActive ? data.rentDiscountType : undefined,
        rentNetTotal: data.rentNetTotal || undefined,
        province: data.province || undefined,
        district: data.district || undefined,
        subDistrict: data.subDistrict || undefined,
        zipCode: data.zipCode || undefined,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
        occupancy: data.occupancy || undefined,
        condition: data.condition ? Number(data.condition) : undefined,
        availableDate: data.availableDate ? new Date(data.availableDate).toISOString() : undefined,
        ownerName: data.ownerName || undefined,
        ownerPhone: data.ownerPhone || undefined,
        amenities: data.amenities,
      };

      let result;
      if (initialData?.id) {
        result = await updatePropertyService(initialData.id, payload);
        
        // Image Sync for Update
        const formData = new FormData();
        const keepIds = existingImages.map(img => img.id);
        formData.append("keepImageIds", keepIds.join(","));
        
        selectedFiles.forEach(file => {
          formData.append("images", file);
        });

        // Use the image sync route (PUT)
        await propertyService.updatePropertyImage(initialData.id, formData);
      } else {
        result = await propertyService.createProperty(payload);
        if (selectedFiles.length > 0 && result.id) {
          await propertyService.uploadPropertyImages(result.id, selectedFiles);
        }
      }

      if (onSubmit) await onSubmit(result);
      router.push("/properties");
    } catch (error) {
      console.error("Failed to save property:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก กรุณาลองอีกครั้ง");
    } finally {
      setIsConfirming(false);
    }
  };

  //สุ่มข้อมูล
  const fillMockData = () => {
    setValue("name", `คอนโดทดสอบ ${Math.floor(Math.random() * 1000)}`);
    setValue("description", "รายละเอียดบ้านหรือคอนโดนี้ สร้างขึ้นมาเพื่อการทดสอบ มีสิ่งอำนวยความสะดวกครบครัน เดินทางสะดวก ใกล้สถานีรถไฟฟ้า และใกล้ห้างสรรพสินค้า");
    
    const listingTypes: ("SALES" | "RENT" | "SALE & RENT")[] = ["SALES", "RENT", "SALE & RENT"];
    setValue("listingType", listingTypes[Math.floor(Math.random() * listingTypes.length)]);
    
    if (brands.length > 0) {
      setValue("brandId", String(brands[Math.floor(Math.random() * brands.length)].id));
    }
    
    setValue("startingPrice", String(Math.floor(Math.random() * 10000000) + 1000000));
    setValue("estimatedInstallment", String(Math.floor(Math.random() * 50000) + 10000));
    setValue("discountActive", Math.random() > 0.5);
    setValue("discountType", Math.random() > 0.5 ? "BAHT" : "PERCENT");
    setValue("discount", String(Math.floor(Math.random() * 100000) + 5000));
    
    setValue("rentPrice", String(Math.floor(Math.random() * 50000) + 5000));
    setValue("rentDiscountActive", Math.random() > 0.5);
    setValue("rentDiscountType", Math.random() > 0.5 ? "BAHT" : "PERCENT");
    setValue("rentDiscount", String(Math.floor(Math.random() * 5000) + 500));
    setValue("rentNetTotal", String(Math.floor(Math.random() * 45000) + 4000));
    
    const categories: ("DETACHED_HOUSE" | "TWIN_HOUSE" | "TOWNHOME" | "CONDOMINIUM")[] = ["DETACHED_HOUSE", "TWIN_HOUSE", "TOWNHOME", "CONDOMINIUM"];
    setValue("category", categories[Math.floor(Math.random() * categories.length)]);
    
    setValue("projectArea", String((Math.random() * 10).toFixed(2)));
    setValue("landArea", String((Math.random() * 100).toFixed(2)));
    setValue("usableArea", String(Math.floor(Math.random() * 200) + 20));
    setValue("totalUnits", Math.floor(Math.random() * 500) + 10);
    setValue("parkingSpaces", Math.floor(Math.random() * 300) + 10);
    setValue("parkingPercent", String(Math.floor(Math.random() * 100)));
    setValue("studio", Math.floor(Math.random() * 2));
    setValue("bedrooms", Math.floor(Math.random() * 5) + 1);
    setValue("bathrooms", Math.floor(Math.random() * 5) + 1);
    
    const facings = ["เหนือ", "ใต้", "ตะวันออก", "ตะวันตก", "ตะวันออกเฉียงเหนือ", "ตะวันออกเฉียงใต้", "ตะวันตกเฉียงเหนือ", "ตะวันตกเฉียงใต้"];
    setValue("facing", facings[Math.floor(Math.random() * facings.length)]);
    setValue("floor", Math.floor(Math.random() * 50) + 1);
    setValue("building", `Building ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`);
    setValue("commonFee", String(Math.floor(Math.random() * 100) + 30));

    setValue("ownerName", "สมชาย เข็มกลัด");
    setValue("ownerPhone", "0812345678");
    setValue("occupancy", Math.random() > 0.5 ? "VACANT" : "OCCUPIED");
    setValue("condition", Math.floor(Math.random() * 5) + 1);
    setValue("availableDate", new Date().toISOString().split('T')[0]);
    
    setValue("address", `123/${Math.floor(Math.random() * 100)} ซอยทดสอบ`);
    setValue("province", "กรุงเทพมหานคร");
    setValue("district", "ดินแดง");
    setValue("subDistrict", "ดินแดง");
    setValue("zipCode", "10400");
    
    setValue("latitude", String((13.7563 + (Math.random() - 0.5) * 0.1).toFixed(6)));
    setValue("longitude", String((100.5018 + (Math.random() - 0.5) * 0.1).toFixed(6)));
    
    const shuffledAmenities = [...AMENITIES].sort(() => 0.5 - Math.random());
    const selectedAmenities = shuffledAmenities.slice(0, Math.floor(Math.random() * 5) + 3).map(a => a.id);
    setValue("amenities", selectedAmenities);
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen pt-24 pb-32 px-4 md:px-12 font-sans text-white/90">
      <motion.div 
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-full mx-auto space-y-6"
      >

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-[28px] font-bold text-white mb-1">เริ่มลงประกาศของคุณ</h1>
          <p className="text-white/40 text-[15px]">กรอกข้อมูลให้ครบถ้วน เพื่อให้ผู้ค้นหาเจออสังหาฯ ของคุณได้ง่ายขึ้น</p>
        </header>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" id="property-form">

          {/* ประเภทการประกาศ */}
          <section className="bg-[#111118] p-6 rounded-2xl border border-white/5">
            <label className="flex items-center gap-2 text-[15px] font-bold mb-4 text-white/80">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" />
              ประเภทการประกาศ <span className="text-amber-500 ml-1">*</span>
            </label>
            <div className="bg-white/5 p-1.5 rounded-full flex relative mx-auto w-full">
              {LISTING_TYPES.map(type => {
                const isActive = watchListingType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue("listingType", type.value as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-amber-500/10 text-amber-400 shadow-sm ring-1 ring-amber-500/20"
                        : "text-white/50 hover:text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <span className={isActive ? "opacity-100" : "opacity-60"}>{type.icon}</span>
                    {type.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ข้อมูลทั่วไปโครงการ */}
          <section className="bg-[#111118] p-8 rounded-2xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold mb-6 text-white">ข้อมูลทั่วไปโครงการ</h2>

            <div className="space-y-6">
              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">
                  ชื่อโครงการ <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "กรุณากรอกชื่อโครงการ" })}
                  placeholder="เช่น โครงการ Nue REN แจ้งวัฒนะ..."
                  className="w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">
                  รายละเอียดโครงการ <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description", { required: "กรุณากรอกรายละเอียด" })}
                  placeholder="เขียนอธิบายรายละเอียด จุดเด่น หรือสิ่งอำนวยความสะดวก"
                  rows={4}
                  className="w-full p-4 bg-white/5 text-sm rounded-xl outline-none transition resize-none placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">รูปภาพโครงการ (สูงสุด 10 รูป)</label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition cursor-pointer relative overflow-hidden group min-h-[220px]"
                >
                  {previewUrls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                      {previewUrls.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group/img bg-black/20 border border-white/10">
                          <img src={url} className="w-full h-full object-cover" alt={`Preview ${i + 1}`} />
                          <button 
                            type="button" 
                            onClick={(e) => removeImage(e, i)} 
                            className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/img:opacity-100 scale-90 hover:scale-100 shadow-lg"
                          >
                            <X size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                      {previewUrls.length < 10 && (
                        <div 
                          onClick={() => document.getElementById("file-upload")?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center hover:bg-white/5 transition cursor-pointer text-white/30 hover:text-white/60 gap-2"
                        >
                          <ImageIcon size={24} />
                          <span className="text-[10px] font-medium">+ เพิ่มรูป</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center text-neutral-400 mb-1 pointer-events-none">
                        <ImageIcon size={44} strokeWidth={1.5} />
                      </div>
                      <p className="text-[13px] text-white/40 font-medium pointer-events-none text-center">
                        คลิกเพื่ออัพโหลด หรือ ลากไฟล์มาวางที่นี่<br/>
                        <span className="text-[11px] text-white/20 mt-1 inline-block">(รองรับสูงสุด 10 รูป)</span>
                      </p>
                    </>
                  )}
                  <input id="file-upload" type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">
                    ประเภทอสังหาริมทรัพย์ <span className="text-red-500">*</span>
                  </label>
                  <DarkSelect
                    options={CATEGORIES}
                    value={watch("category") || ""}
                    onChange={(val) => {
                      setValue("category", val as any);
                      setValue("brandId", "");
                    }}
                    placeholder="เลือกประเภท"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">
                    โครงการ (Brand)
                  </label>
                  <DarkSelect
                    options={
                      brandsLoading
                        ? [{ value: "", label: "กำลังโหลดโครงการ..." }]
                        : [
                            { value: "", label: "ไม่ระบุโครงการ" },
                            ...brands
                              .filter(b => b.category === watch("category"))
                              .map(b => ({
                                value: String(b.id),
                                label: `${b.name} (${CATEGORIES.find(c => c.value === b.category)?.label || b.category})`,
                              })),
                          ]
                    }
                    value={String(watch("brandId") || "")}
                    onChange={(val) => setValue("brandId", val)}
                    placeholder={brandsLoading ? "กำลังโหลดโครงการ..." : "ไม่ระบุโครงการ"}
                  />
                  {errors.brandId && <p className="text-red-500 text-xs mt-1">{errors.brandId.message}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* ข้อมูลราคาขาย (Sales Information) */}
          <AnimatePresence>
            {(watchListingType === "SALES" || watchListingType === "SALE & RENT") && (
              <motion.section 
                initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                className="bg-[#111118] p-8 rounded-2xl border border-white/5 space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Key size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-white">ข้อมูลราคาขาย</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[13px] font-bold text-white/60 mb-2 block">
                        ราคาขาย (บาท) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        {...register("startingPrice", { required: watchListingType !== "RENT" ? "กรุณากรอกราคา" : false })}
                        placeholder="เช่น 1,000,000"
                        className="w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition no-spinner placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                      />
                      {errors.startingPrice && <p className="text-red-500 text-xs mt-1">{errors.startingPrice.message}</p>}
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-white/60 mb-2 block">
                        ค่างวดประเมิน (บาท/เดือน)
                      </label>
                      <input
                        type="number"
                        {...register("estimatedInstallment")}
                        placeholder="เช่น 15,000"
                        className="w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition no-spinner placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="p-5 bg-white/5 rounded-xl border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white/90 text-sm">ส่วนลดพิเศษ</p>
                        <p className="text-xs text-white/40 mt-1">เปิดใช้งานสำหรับโปรโมชั่นหรือส่วนลดพิเศษ</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" {...register("discountActive")} className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    <AnimatePresence>
                      {watchDiscountActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0, overflow: "hidden" }}
                          animate={{ opacity: 1, height: "auto", marginTop: 16, overflow: "visible" }}
                          exit={{ opacity: 0, height: 0, marginTop: 0, overflow: "hidden" }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <div>
                            <label className="text-[12px] font-bold text-white/50 mb-1.5 block">ประเภทส่วนลด</label>
                            <DarkSelect
                              options={[
                                { value: "BAHT", label: "ลดเป็นบาท (Baht)" },
                                { value: "PERCENT", label: "ลดเป็นเปอร์เซ็นต์ (%)" }
                              ]}
                              value={watch("discountType") || "BAHT"}
                              onChange={(val) => setValue("discountType", val as any)}
                            />
                          </div>
                          <div>
                            <label className="text-[12px] font-bold text-white/50 mb-1.5 block">
                              มูลค่าส่วนลด
                            </label>
                            <input
                              type="number"
                              {...register("discount")}
                              placeholder="เช่น 50000 หรือ 5"
                              className="w-full p-3.5 bg-white/5 text-sm rounded-xl no-spinner outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ข้อมูลค่าเช่า (Rent Information) */}
          <AnimatePresence>
            {(watchListingType === "RENT" || watchListingType === "SALE & RENT") && (
              <motion.section 
                initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                className="bg-[#111118] p-8 rounded-2xl border border-white/5 space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Building2 size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-white">ข้อมูลค่าเช่า</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[13px] font-bold text-white/60 mb-2 block">
                        ค่าเช่า (บาท/เดือน) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        {...register("rentPrice", { required: watchListingType !== "SALES" ? "กรุณากรอกค่าเช่า" : false })}
                        placeholder="เช่น 15,000"
                        className="no-spinner w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                      />
                      {errors.rentPrice && <p className="text-red-500 text-xs mt-1">{errors.rentPrice.message}</p>}
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-white/60 mb-2 block">
                        ค่าเช่าสุทธิ (หลังหักส่วนลด / โปรโมชั่น)
                      </label>
                      <input
                        type="number"
                        {...register("rentNetTotal")}
                        placeholder="เช่น 14,000"
                        className="no-spinner w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="p-5 bg-white/5 rounded-xl border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white/90 text-sm">ส่วนลดพิเศษสำหรับเช่า</p>
                        <p className="text-xs text-white/40 mt-1">เปิดใช้งานเพื่อระบุการลดราคาค่าเช่า</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" {...register("rentDiscountActive")} className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    <AnimatePresence>
                      {watchRentDiscountActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0, overflow: "hidden" }}
                          animate={{ opacity: 1, height: "auto", marginTop: 16, overflow: "visible" }}
                          exit={{ opacity: 0, height: 0, marginTop: 0, overflow: "hidden" }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <div>
                            <label className="text-[12px] font-bold text-white/50 mb-1.5 block">ประเภทส่วนลดเช่า</label>
                            <DarkSelect
                              options={[
                                { value: "BAHT", label: "ลดเป็นบาท (Baht)" },
                                { value: "PERCENT", label: "ลดเป็นเปอร์เซ็นต์ (%)" }
                              ]}
                              value={watch("rentDiscountType") || "BAHT"}
                              onChange={(val) => setValue("rentDiscountType", val as any)}
                            />
                          </div>
                          <div>
                            <label className="text-[12px] font-bold text-white/50 mb-1.5 block">
                              มูลค่าส่วนลด
                            </label>
                            <input
                              type="number"
                              {...register("rentDiscount")}
                              placeholder="เช่น 1000 หรือ 5"
                              className="no-spinner w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ข้อมูลพื้นที่และสัดส่วน */}
          <section className="bg-[#111118] p-8 rounded-2xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold mb-6 text-white">ข้อมูลพื้นที่และสัดส่วน</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">พื้นที่โครงการ(ไร่)</label>
                <input type="number" step="0.01" {...register("projectArea")} className="w-full no-spinner p-3 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">พื้นที่ดิน(ตารางวา)</label>
                <input type="number" step="0.01" {...register("landArea")} className="w-full no-spinner p-3 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">พื้นที่ใช้สอย(ตร.ม.)</label>
                <input type="number" step="0.01" {...register("usableArea")} className="w-full no-spinner p-3 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">จำนวนยูนิตทั้งหมด</label>
                <input type="number" {...register("totalUnits")} className="w-full no-spinner p-3 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>

              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">จำนวนที่จอดรถ(คัน)</label>
                <input type="number" {...register("parkingSpaces")} className="w-full no-spinner p-3 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">ที่จอดรถ(%)</label>
                <input type="number" step="0.01" max="100" {...register("parkingPercent", { max: { value: 999.99, message: "ค่าสูงสุดคือ 999.99" } })} className="w-full no-spinner p-3 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
                {errors.parkingPercent && <p className="text-red-500 text-xs mt-1">{errors.parkingPercent.message}</p>}
              </div>

              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">จำนวนห้องสตูดิโอ(ห้อง)</label>
                <input type="number" {...register("studio")} className="w-full no-spinner p-3 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">จำนวนห้องนอน(ห้อง)</label>
                <input type="number" {...register("bedrooms")} className="w-full no-spinner p-3 bg-white/5 no-spinner rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>

              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">จำนวนห้องน้ำ(ห้อง)</label>
                <input type="number" {...register("bathrooms")} className="w-full no-spinner p-3 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">ทิศของห้อง</label>
                <DarkSelect
                  options={[
                    { value: "", label: "เลือกทิศ" },
                    ...FACING_DIRECTIONS.map(f => ({ value: f, label: f })),
                  ]}
                  value={watch("facing") || ""}
                  onChange={(val) => setValue("facing", val)}
                  placeholder="เลือกทิศ"
                />
              </div>
              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">ชั้นที่</label>
                <input type="number" {...register("floor")} className="w-full no-spinner p-3 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>

              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">อาคาร/ตึก</label>
                <input type="text" {...register("building")} className="w-full no-spinner p-3 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">ค่าส่วนกลาง(บาท/เดือน)</label>
                <input type="number" step="0.01" {...register("commonFee")} className="w-full no-spinner p-3 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>
            </div>
          </section>

          {/* ข้อมูลตำแหน่งที่ตั้ง */}
          <section className="bg-[#111118] p-8 rounded-2xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold mb-6 text-white">ข้อมูลตำแหน่งที่ตั้ง</h2>

            <div className="space-y-6">
              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">ที่อยู่/ทำเลโครงการ</label>
                <input
                  {...register("address")}
                  placeholder="บ้านเลขที่ ถนน แขวง เขต"
                  className="w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">จังหวัด</label>
                  <input {...register("province")} placeholder="เช่น กรุงเทพมหานคร" className="w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">เขต/อำเภอ</label>
                  <input {...register("district")} placeholder="เช่น ดินแดง" className="w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">แขวง/ตำบล</label>
                  <input {...register("subDistrict")} placeholder="เช่น ดินแดง" className="w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">รหัสไปรษณีย์</label>
                  <input {...register("zipCode")} placeholder="เช่น 10400" className="w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>

              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">ค้นหาสถานที่</label>
                <input placeholder="เช่น สยามพารากอน" className="w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
              </div>

              <div>
                <label className="text-[13px] font-bold text-white/60 mb-2 block">เลือกตำแหน่งบนแผนที่</label>
                <MapPicker 
                  lat={parseFloat(watchLat) || 13.7563} 
                  lng={parseFloat(watchLng) || 100.5018} 
                  onLocationSelect={(lat, lng) => {
                    setValue("latitude", lat.toString());
                    setValue("longitude", lng.toString());
                  }} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">Latitude</label>
                  <input type="number" step="any" {...register("latitude")} className="no-spinner w-full p-3.5 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">Longitude</label>
                  <input type="number" step="any" {...register("longitude")} className="no-spinner w-full p-3.5 bg-white/5 rounded-xl outline-none text-sm transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>
            </div>
          </section>

          {/* สิ่งอำนวยความสะดวก */}
          <section className="bg-[#111118] p-8 rounded-2xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold mb-6 text-white">สิ่งอำนวยความสะดวก(Amenities)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
              {AMENITIES.map(amenity => {
                const active = watchAmenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-[13px] font-medium ${
                      active
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                    }`}
                  >
                    <Tag size={16} className={active ? "text-amber-400" : "text-white/30"} />
                    <span>{amenity.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ข้อมูลเจ้าของและสถานะ (Owner & Status Information) */}
          <section className="bg-[#111118] p-8 rounded-2xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold mb-6 text-white">ข้อมูลเจ้าของและสถานะทรัพย์สิน</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">
                    ชื่อเจ้าของ (Owner Name)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                      <User size={18} />
                    </div>
                    <input
                      {...register("ownerName")}
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full pl-10 pr-4 py-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">
                    เบอร์ติดต่อ (Owner Phone)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                      <Phone size={18} />
                    </div>
                    <input
                      {...register("ownerPhone")}
                      placeholder="เช่น 081-xxx-xxxx"
                      className="w-full pl-10 pr-4 py-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">
                    สถานะการอยู่อาศัย (Occupancy)
                  </label>
                  <DarkSelect
                    options={[
                      { value: "", label: "ไม่ระบุ" },
                      { value: "VACANT", label: "ว่าง (Vacant)" },
                      { value: "OCCUPIED", label: "มีผู้เช่า/ผู้พักอาศัย (Occupied)" }
                    ]}
                    value={watch("occupancy") || ""}
                    onChange={(val) => setValue("occupancy", val as any)}
                    placeholder="เลือกสถานะ"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">
                    สภาพทรัพย์สิน (Condition 1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    {...register("condition", { min: 1, max: 5 })}
                    placeholder="1 = แย่สุด, 5 = ดีมาก"
                    className=" no-spinner w-full p-3.5 bg-white/5 text-sm rounded-xl outline-none transition placeholder:text-white/30 text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-white/60 mb-2 block">
                    วันที่พร้อมเข้าอยู่ (Available Date)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="date"
                      {...register("availableDate")}
                      className="w-full pl-10 pr-4 py-3.5 bg-white/5 text-sm rounded-xl outline-none transition text-white/80 focus:bg-white/10 focus:ring-1 focus:ring-amber-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </form>
      </motion.div>

      {/* FLOATING ACTION BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-[#111118]/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-full p-2 flex items-center gap-2 border border-white/10">

          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-full flex items-center gap-2 text-red-500 font-bold text-[13px] hover:bg-red-50 transition-colors"
          >
            <X size={16} strokeWidth={3} />
            ยกเลิก
          </button>

          {/* Test Button */}
          <button
            type="button"
            onClick={fillMockData}
            className="px-6 py-2.5 rounded-full flex items-center gap-2 text-blue-400 font-bold text-[13px] hover:bg-blue-500/10 transition-colors"
          >
            <Wand2 size={16} strokeWidth={2.5} />
            สุ่มข้อมูล
          </button>

          {/* Save Button */}
          <button
            type="submit"
            form="property-form"
            disabled={isSubmitting || isConfirming}
              className="px-8 py-2.5 rounded-full bg-amber-500 text-white font-bold text-[13px] shadow-[0_4px_14px_rgba(245,158,11,0.39)] hover:bg-amber-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting || isConfirming ? (
              "กำลังบันทึก..."
            ) : (
              <>
                <Save size={16} strokeWidth={2.5} />
                บันทึกโครงการ
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {(isSubmitting || isConfirming) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#E6F0FF] border-t-[#0056FF] rounded-full animate-spin" />
              <p className="font-bold text-neutral-800 tracking-wide text-sm">กำลังดำเนินการ...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
