"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { adminPropertiesService } from "@/services/admin/properties";

const PropertiesDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const fetchProperty = async () => {
    try {
      const res = await adminPropertiesService.getPropertyById(id as string);
      setProperty(res);
    } catch (error) {
      console.error("Error fetching property:", error);
    }
  };
  useEffect(() => {
    fetchProperty();
  }, [id]);
  return (
    <div className="w-full flex flex-col gap-4 text-white p-4 bg-neutral-800 rounded-xl">
      <h1>รายละเอียดทรัพย์สิน</h1>
      <img
        className="w-full h-96 object-cover aspect-video rounded-xl"
        src={property?.image}
        alt={property?.title}
      />
      <div>
        user id : 12321312
        <p>user name : somsik narak</p>
        <p>user email : [EMAIL_ADDRESS]</p>
        <p>user phone : 0812345678</p>
        <p>user address : 123 Main St</p>
      </div>
      <p className="text-lg font-medium">{property?.title}</p>
      <p className="text-sm text-neutral-400">{property?.description}</p>
      <p className="text-sm text-neutral-400">{property?.price}</p>
      <p className="text-sm text-neutral-400">{property?.type}</p>
      <p className="text-sm text-neutral-400">{property?.status}</p>
      <div className="flex gap-2">
        <button className="py-2 px-4 rounded-xl bg-neutral-700">อนุมัติ</button>
        <button className="py-2 px-4 rounded-xl bg-neutral-700">
          ไม่อนุมัติ
        </button>
      </div>
    </div>
  );
};

export default PropertiesDetails;
