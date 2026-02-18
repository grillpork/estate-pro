"use client";
import ListingProperty from "@/components/FormProperty";

const createPropertyPage = () => {
  const handleAfterSubmit = async () => {
     try {
    // สร้างทรัพย์สินสำเร็จ
     } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <div>
      <ListingProperty onSubmit={handleAfterSubmit} />
    </div>
  );
};

export default createPropertyPage;
