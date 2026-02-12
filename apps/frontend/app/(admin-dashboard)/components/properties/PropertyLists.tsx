"use client";
import { useEffect, useState } from "react";
import { adminPropertiesService } from "@/services/admin/properties";

const PropertyLists = () => {
  const [properties, setProperties] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [filterStatus, setFilterStatus] = useState("");

  const fetchProperties = async () => {
    try {
      let res;
      if (searchTerm.trim()) {
        res = await adminPropertiesService.searchProperties(searchTerm);
      } else {
        res = await adminPropertiesService.getAllProperties();
      }
      setProperties(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    }
  };

  const handleFilterStatus = (status: string) => {
    setFilterStatus(status);
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบประกาศนี้?")) {
      await adminPropertiesService.deleteProperty(id);
      fetchProperties();
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminPropertiesService.updatePropertyStatus(id, status);
      fetchProperties(); // Refresh list after update
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    fetchProperties();
    handleFilterStatus(filterStatus);
  }, [searchTerm]);

  return (
    <div className="w-full flex flex-col gap-4 text-white p-4 bg-neutral-800 rounded-xl">
      <h1 className="text-2xl font-bold">รายการทรัพย์สิน</h1>
      <input
        type="text"
        placeholder="ค้นหาทรัพย์สิน"
        className="w-full p-2 rounded-xl bg-neutral-900 border border-neutral-700"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={() => handleFilterStatus("all")}
          className="py-2 px-4 rounded-xl bg-neutral-700"
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => handleFilterStatus("sale")}
          className="py-2 px-4 rounded-xl bg-neutral-700"
        >
          ขาย
        </button>
        <button
          onClick={() => handleFilterStatus("rent")}
          className="py-2 px-4 rounded-xl bg-neutral-700"
        >
          เช่า
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {properties?.map((property: any) => (
          <div key={property.id} className="flex gap-2 p-2">
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
              <p>{property.Owner?.name}</p>
              <p>{property.status}</p>
              {property.amenities.map((item: string, index: number) => (
                <span key={index}>
                  {item}
                  <br />
                </span>
              ))}
              <p>
                {new Date(property.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="flex gap-2 mt-2">
                {property.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateStatus(property.id, "approved")
                      }
                      className="py-2 px-4 rounded-xl bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      อนุมัติ
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(property.id, "rejected")
                      }
                      className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      ไม่อนุมัติ
                    </button>
                  </>
                )}
                {property.status !== "pending" && (
                  <span
                    className={`px-3 py-1 rounded-lg text-sm ${
                      property.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {property.status === "approved"
                      ? "อนุมัติแล้ว"
                      : "ถูกปฏิเสธ"}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(property.id)}
                  className="py-2 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 transition-colors ml-auto"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p>รายการทรัพย์สินทั้งหมด {properties.length}</p>
    </div>
  );
};

export default PropertyLists;
