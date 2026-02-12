"use client";
import ListingProperty from "@/components/FormProperty";
import { propertyService } from "@/services/client/property";

const createPropertyPage = () => {
  const submitProperty = async (data: any) => {
    try {
      await propertyService.createProperty(data);
      alert("สร้างทรัพย์สินสำเร็จ");
      // Could redirect or reset here
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
      throw error;
    }
  };
  return (
    <div>
      <ListingProperty onSubmit={(data) => submitProperty(data)} />
    </div>
  );
};

export default createPropertyPage;
