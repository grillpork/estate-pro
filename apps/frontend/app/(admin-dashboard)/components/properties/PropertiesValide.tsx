"use client";
import { useEffect, useState } from "react";
import { adminPropertiesService } from "@/services/admin/properties";
import Link from "next/link";

const PropertiesValide = () => {
  const [properties, setProperties] = useState<any>([]);

  const fetchProperties = async () => {
    try {
      const res = await adminPropertiesService.getAllProperties();
      setProperties(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);
  return (
    <div className="w-full flex flex-col gap-4 text-white p-4 bg-neutral-800 rounded-xl">
      <h1 className="text-2xl font-bold">รายการทรัพย์สินที่ต้องตรวจสอบ</h1>
      <div className="flex flex-col gap-2">
        {properties?.map((property: any) => (
          <Link
            href={`/dashboard/properties/${property.id}`}
            key={property.id}
            className="flex gap-2 p-2"
          >
            <img
              className="w-48 object-cover aspect-video rounded-xl"
              src={property.image}
              alt={property.title}
            />
            <div className="flex flex-col gap-2">
              <p className="text-sm p-3 bg-neutral-700 rounded-xl w-fit line-clamp-1">
                $ {property.price.toLocaleString()}
              </p>
              <p className="text-lg font-medium line-clamp-2">
                {property.title}
              </p>
              <p className="text-sm text-neutral-400 line-clamp-2">
                {property.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PropertiesValide;
