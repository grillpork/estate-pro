"use client";
import React, { useEffect, useState } from "react";
import ListingProperty from "@/components/FormProperty";
import {
  getPropertyById,
  updatePropertyService,
} from "@/services/client/property";
import { useRouter } from "next/navigation";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = React.use(params);
  const [property, setProperty] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(unwrappedParams.id);
        setProperty(data);
      } catch (error) {
        console.error("Failed to fetch property", error);
        alert("ไม่พบข้อมูลทรัพย์สิน");
        router.push("/properties");
      }
    };
    if (unwrappedParams.id) {
      fetchProperty();
    }
  }, [unwrappedParams.id, router]);

  const handleSubmit = async (data: any) => {
    try {
      await updatePropertyService(unwrappedParams.id, data);
      alert("แก้ไขข้อมูลสำเร็จ");
      router.push("/properties"); // Redirect back to list
    } catch (error) {
      console.error("Update failed", error);
      alert("เกิดข้อผิดพลาดในการแก้ไข");
    }
  };

  if (!property) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขทรัพย์สิน</h1>
      <ListingProperty
        initialData={property}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
