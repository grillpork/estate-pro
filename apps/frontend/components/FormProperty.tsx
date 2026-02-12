"use client";
import { useEffect, useState } from "react";
import {
  propertyService,
  updatePropertyService,
} from "@/services/client/property";
import { useForm } from "react-hook-form";
import { Car, Tv } from "lucide-react";

interface PropertyFormData {
  id: string;
  title: string;
  description: string;
  floor: number;
  price: number;
  address: string;
  image: string;
  status: "pending" | "approved" | "rejected";
  type: "rent" | "buy";
  amenities: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ListingType {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

const amenitiesList = [
  { value: "parking", label: "ที่จอดรถ", icon: <Car /> },
  { value: "TV", label: "ทีวี", icon: <Tv /> },
];

const ListingProperty = ({ initialData, onSubmit, onCancel  }: ListingType) => {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    defaultValues: {
      status: "pending",
      amenities: [],
      type: "rent",
    },
  });

  const watchAmenities = watch("amenities") || [];

  const filteredAmenities = amenitiesList.filter((amenity) => {
    amenity.label.toLocaleLowerCase();
  });

  //useEffect เพื่อดึงข้อมูลอสังหาริมทรัพย์
  useEffect(() => {
    if (initialData) {
      setValue("title", initialData.title);
      setValue("description", initialData.description);
      setValue("floor", initialData.floor);
      setValue("price", initialData.price);
      setValue("address", initialData.address);
      setValue("image", initialData.image);
      setValue("status", initialData.status);
      setValue("type", initialData.type);
      if (Array.isArray(initialData.amenities)) {
        setValue("amenities", initialData.amenities);
      }
      setValue("userId", initialData.userId);
      setValue("createdAt", initialData.createdAt);
      setValue("updatedAt", initialData.updatedAt);
    }
  }, [initialData, setValue]);

  //สร้าง handle amenities
  const handleAmenities = (value: string) => {
    const current = watchAmenities;
  };

  //remove amenities
  const removeAmenities = (value: string) => {
    const current = watchAmenities;
  };

  //ส้ราง handle submit
  const onSubmitForm = async (data: any) => {
    setApiError(null);
    try {
      const formatedData = {
        ...data,
        price: Number(data.price),
      };

      if (initialData) {
        await updatePropertyService(initialData.id, formatedData);
      }

      if (!initialData) {
        await propertyService.createProperty(formatedData);
      }

      if (onSubmit) {
        await onSubmit(formatedData);
      }

      if (!initialData) {
        reset();
        setValue("amenities", []);
      }
    } catch (error : any) {
      setApiError("เกิดข้อผิดพลาดในการสร้างทรัพย์สิน");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitForm)}
      className="flex flex-col gap-3 max-w-5xl mx-auto"
    >
      <input
        {...register("title")}
        className="py-4 px-6 bg-black text-white rounded-2xl"
        type="text"
        placeholder="ชื่อทรัพย์สิน"
      />
      <input
        {...register("description")}
        className="py-4 px-6 bg-black text-white rounded-2xl"
        type="text"
        placeholder="รายละเอียด"
      />
      <input
        {...register("price")}
        className="py-4 px-6 bg-black text-white rounded-2xl"
        type="text"
        placeholder="ราคา"
      />
      <input
        {...register("floor")}
        className="py-4 px-6 bg-black text-white rounded-2xl"
        type="text"
        placeholder="ชั้น"
      />
      <input
        {...register("address")}
        className="py-4 px-6 bg-black text-white rounded-2xl"
        type="text"
        placeholder="ที่อยู่"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="py-4 px-6 bg-black text-white rounded-2xl"
      >
        {isSubmitting ? "กำลังบันทึก..." : initialData ? "อัปเดต" : "สร้าง"}
      </button>
    </form>
  );
};

export default ListingProperty;
